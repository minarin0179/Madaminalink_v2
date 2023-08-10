import {
    AttachmentBuilder,
    CategoryChannel,
    ChannelType,
    GuildChannel,
    SlashCommandBuilder,
    TextBasedChannel,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { CategoryData, ChannelData, MessageData, ExportData, RoleData, fileData } from "../../structures/ExportData";
import fs from "fs";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import crypto from "crypto";
import archiver from "archiver";
import fetch from "cross-fetch";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("export")
        .setDescription("カテゴリーをファイルに出力します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .setName("対象")
                .setDescription("出力するカテゴリー")
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("ロールを再利用")
                .setDescription("はいを選択した場合ロールは再利用されます")
                .setRequired(false)
                .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const category = args.getChannel("対象", true) as CategoryChannel;
        const reuseRoles = args.getString("ロールを再利用") == "true";

        const path = `./output.zip`;
        const archive = archiver("zip", { zlib: { level: 9 } });
        const output = fs.createWriteStream(path);
        archive.pipe(output);

        const categoryData: CategoryData = (channel => ({
            name: channel.name,
            permissionOverwrites: channel.permissionOverwrites.cache,
        }))(category);

        const channels = category.children.cache
            .filter((c: GuildChannel) => [ChannelType.GuildText, ChannelType.GuildVoice].includes(c.type))
            .sort((a, b) => a.rawPosition - b.rawPosition); //昇順

        const channelDatas: ChannelData[] = await Promise.all(
            channels.map(async (channel): Promise<ChannelData> => {
                const messages = channel.isTextBased() ? await fetchMessages(channel, archive) : [];
                return {
                    id: channel.id,
                    name: channel.name,
                    type: channel.type,
                    nsfw: channel.nsfw,
                    rateLimitPerUser: channel.rateLimitPerUser || 0,
                    permissionOverwrites: channel.permissionOverwrites.cache,
                    messages,
                };
            })
        );

        const roleIDs = new Set<string>([
            ...category.permissionOverwrites.cache.keys(),
            ...channels.map(channel => [...channel.permissionOverwrites.cache.keys()]).flat(),
        ]);

        const roleDatas =
            interaction.guild?.roles.cache
                .filter(role => roleIDs.has(role.id))
                .filter(role => role.id != interaction.guild?.roles.everyone.id)
                .sort((a, b) => b.rawPosition - a.rawPosition) //降順
                .map(role => <RoleData>role) || [];

        const everyoneRoleID = interaction.guild?.roles.everyone.id || "";

        const data: ExportData = {
            categoryData,
            channelDatas,
            roleDatas,
            fileDatas: [],
            everyoneRoleID,
            reuseRoles,
        };

        archive.append(JSON.stringify(data), { name: "main.json" });

        await archive.finalize();

        const stats = fs.statSync(path);
        const fileSizeInBytes = stats.size;
        const fileSizeInKb = fileSizeInBytes / 1024;
        console.log(`ZIPファイルのサイズ: ${fileSizeInKb.toFixed(2)} KB`);

        await reply(interaction, {
            files: [new AttachmentBuilder(path).setName(`${category.id}.zip`)],
            ephemeral: false,
        }).catch(() => {});
    },
});

const fetchMessages = async (channel: TextBasedChannel, archive: archiver.Archiver): Promise<MessageData[]> =>
    await Promise.all(
        (await fetchAllMessages(channel)).map(
            async ({ content, attachments, embeds, components, reactions }): Promise<MessageData> => {
                const files: fileData[] = await Promise.all(
                    attachments.map(async attachment => {
                        const uuid = crypto.randomUUID();
                        const data = await fetch(attachment.url).then(res => res.arrayBuffer());
                        const buffer = Buffer.from(data);
                        archive.append(buffer, { name: attachment.name });

                        return {
                            name: attachment.name,
                            description: attachment.description,
                            attachment: uuid,
                        };
                    })
                );
                return {
                    content,
                    files,
                    embeds,
                    components,
                    reactions: reactions.cache,
                };
            }
        )
    );
