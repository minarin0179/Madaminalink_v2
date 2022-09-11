import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";


export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('マダミナリンクの稼働状況を確認します!')
        .setDMPermission(true),
    execute: async ({ client, interaction }) => {
        await interaction.reply({
            content: `マダミナリンクは現在稼働中です!(${client.ws.ping}ms)`,
            ephemeral: true
        })
    }
})