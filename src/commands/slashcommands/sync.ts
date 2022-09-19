import { ChannelType, SlashCommandBuilder, CategoryChannel } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('sync')
        .setDescription('カテゴリ内のチャンネルの権限を同期します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .addChannelTypes(ChannelType.GuildCategory)
            .setName('同期するカテゴリ')
            .setDescription('同期するカテゴリ')
            .setRequired(true)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })

        const category = args.getChannel('同期するカテゴリ', true) as CategoryChannel

        await Promise.all(category.children.cache.map(async ch => {
            await ch.lockPermissions()
        }))

        await reply(interaction, `「${category.name}」内のチャンネルの権限を同期しました`)
    }
})