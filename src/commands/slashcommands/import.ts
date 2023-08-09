import { ChannelType, Guild, GuildChannel, GuildChannelTypes, SlashCommandBuilder, Snowflake } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import fetch from "cross-fetch";
import { ExportData } from "../../structures/ExportData";
import { openMessage } from "./open";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("import")
        .setDescription("/exportで出力したファイルを読み込みます")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addAttachmentOption(option =>
            option.setName("ファイル").setDescription("ファイル").setRequired(true)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const { url } = args.getAttachment("ファイル", true);

        const response = await fetch(url);
        const data: ExportData = await response.json();

        const { guild } = interaction;
        if (!guild) return reply(interaction, "サーバー内で実行してください");

        const { categoryData, channelDatas, roleDatas, everyoneRoleID } = data;

        const roles = await Promise.all(roleDatas.map(roleData => guild.roles.create(roleData)));

        const roleMaps = roleDatas.reduce(
            (acc, roledata, index) => {
                acc[roledata.id] = roles[index].id;
                return acc;
            },
            {} as Record<string, string>
        );

        roleMaps[everyoneRoleID] = guild.roles.everyone.id;

        const category = await guild.channels.create({
            ...categoryData,
            type: ChannelType.GuildCategory,
            permissionOverwrites: categoryData.permissionOverwrites.map(overwrite => ({
                ...overwrite,
                id: roleMaps[overwrite.id] ?? overwrite.id, //ロールのidを新しいものに変換
            })),
        });

        const channels = await Promise.all(
            channelDatas.map(
                async (channelData): Promise<GuildChannel> =>
                    guild.channels.create<GuildChannelTypes>({
                        ...channelData,
                        parent: category,
                        permissionOverwrites: channelData.permissionOverwrites.map(overwrite => ({
                            ...overwrite,
                            id: roleMaps[overwrite.id] ?? overwrite.id, //ロールのidを新しいものに変換
                        })),
                    })
            )
        );

        const channelMaps = channelDatas.reduce(
            (acc, channelData, index) => {
                acc[channelData.id] = channels[index].id;
                return acc;
            },
            {} as Record<string, string>
        );

        await Promise.all(
            channelDatas.map(async (channelData, index) => {
                const channel = channels[index];
                if (!channel.isTextBased()) return;

                for await (const message of channelData.messages) {
                    Object.entries(channelMaps).forEach(([id, newId]: [string, string]) => {
                        message.content = message.content.replace(new RegExp(`<#${id}>`, "g"), `<#${newId}>`);
                    });
                    Object.entries(roleMaps).forEach(([id, newId]: [string, string]) => {
                        message.content = message.content.replace(new RegExp(`<@&${id}>`, "g"), `<@&${newId}>`);
                    });

                    const customId = message.components[0]?.components[0]?.custom_id;

                    if (customId?.startsWith("transfer")) {
                        const [, id] = customId?.split(/[;:,]/) || [];
                        message.components[0].components[0].custom_id = customId.replace(id, channelMaps[id] ?? id);
                    }
                    if (customId?.startsWith("open")) {
                        const [, channelId, mentionableId] = customId?.split(/[;:,]/) || [];
                        message.components[0].components[0].custom_id = customId
                            .replace(channelId, channelMaps[channelId] ?? channelId)
                            .replace(mentionableId, roleMaps[mentionableId] ?? mentionableId);
                    }
                    const msg = await channel.send(message).catch(e => console.log(e));
                    if (!msg) continue;
                    await Promise.all([...message.reactions.values()].map(reaction => msg.react(reaction.emoji))).catch(
                        () => {}
                    );
                }
            })
        );

        await reply(interaction, "読み込みが完了しました");
    },
});
