import { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } from "discord.js";
import dicebutton from "../components/buttons/diceroll";
import { Command } from "../structures/Command";

export default new Command({
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('ダイスを作成します(xdy)')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addIntegerOption(option => option
            .setName('ダイスの数')
            .setDescription('ダイスの数')
            .setRequired(true)
            .setMinValue(1)
            .setMaxValue(100)
        )
        .addIntegerOption(option => option
            .setName('ダイスの面数')
            .setDescription('ダイスの面数')
            .setRequired(true)
            .setMinValue(2)
            .setMaxValue(10000)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.channel?.send({
            content: `ボタンをクリックしてダイスロール🎲`,
            components: [
                new ActionRowBuilder<ButtonBuilder>()
                    .addComponents(dicebutton.build({
                        x: args.getInteger('ダイスの数'),
                        y: args.getInteger('ダイスの面数')
                    }))
            ]
        })

        await interaction.reply({
            content: 'ダイスを作成しました',
            ephemeral: true
        })
    }
})