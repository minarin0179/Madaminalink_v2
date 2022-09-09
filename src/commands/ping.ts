import { SlashCommandBuilder } from "discord.js";
import { Command } from "../structures/Command";


export default new Command({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('動作確認をしたい!')
        .setDMPermission(true),
    execute: async ({ client, interaction }) => {
        await interaction.reply({
            content: `マダミナリンクは現在稼働中です!(${client.ws.ping}ms)`,
            ephemeral: true
        })
    }
})