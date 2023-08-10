import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("マダミナリンクの稼働状況を確認します")
        .setDMPermission(true),
    execute: async ({ client, interaction }) => {
        await reply(interaction, `マダミナリンクは現在稼働中です (${Math.floor(client.ws.ping)}ms)`);
    },
});
