import {
    Attachment,
    AttachmentBuilder,
    CategoryChannel,
    ChannelType,
    GuildChannel,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { CategoryData, ChannelData, MessageData, ExportData, RoleData } from "../../structures/ExportData";
import fs from "fs";
import { fetchAllMessages } from "../../utils/FetchAllMessages";

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
        //await interaction.deferReply({ ephemeral: true });

        const category = args.getChannel("対象", true) as CategoryChannel;
        const reuseRoles = args.getString("ロールの削除") == "true";

        const categoryData: CategoryData = (channel => ({
            name: channel.name,
            permissionOverwrites: channel.permissionOverwrites.cache,
        }))(category);

        const channels = category.children.cache
            .filter((c: GuildChannel) => [ChannelType.GuildText, ChannelType.GuildVoice].includes(c.type))
            .sort((a, b) => a.rawPosition - b.rawPosition); //昇順

        const channelDatas: ChannelData[] = await Promise.all(
            channels.map(async (channel): Promise<ChannelData> => {
                const messages = channel.isTextBased()
                    ? (await fetchAllMessages(channel)).map(
                          ({ content, attachments, embeds, components, reactions }): MessageData => ({
                              content,
                              files: attachments.map((file: Attachment) => file.url),
                              embeds,
                              components,
                              reactions: reactions.cache,
                          })
                      )
                    : [];
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

        fs.writeFileSync(`output.json`, JSON.stringify(data));

        await reply(interaction, {
            files: [
                new AttachmentBuilder("output.json")
                    .setName(`${category.id}`)
                    .setDescription("読み込む場合は/importを使用してください"),
            ],
            ephemeral: false,
        });

        fs.unlinkSync(`output.json`);
    },
});
