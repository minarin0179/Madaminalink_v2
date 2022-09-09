import { ActionRowBuilder, ButtonBuilder, ChannelType, SlashCommandBuilder } from "discord.js";
import { Command } from "../structures/Command";
import transferButton from "../components/buttons/transfer";

export default new Command({
    data: new SlashCommandBuilder()
        .setName('transfer')
        .setDescription('メッセージを転送するボタンを作成します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('転送先')
            .setDescription('転送先のチャンネルを選択してください')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildNews)
            .setRequired(true)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        const destination = args.getChannel('転送先')
        await interaction.reply({
            content: `「${destination}」に転送するメッセージと同じリアクションを付けてください`,
            ephemeral: true
        })


        await interaction.channel?.send(
            {
                components: [new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(transferButton.build({ destination }))],
            }
        )
    }
})