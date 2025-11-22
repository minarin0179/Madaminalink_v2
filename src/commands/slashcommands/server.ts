import { GatewayRateLimitError, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { generateGatewayLimitMessage } from "../../utils/generateGatewayLimitMessage";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("メンバー数、ロール数、チャンネル数を表示します")
        .setDMPermission(false),

    execute: async ({ interaction }) => {
        const guild = interaction.guild;
        if (!guild) return;

        try {
            const members = await guild.members.fetch();
            const [bot, user] = members.partition(member => member.user.bot);

            await reply(
                interaction,
                `
    メンバー数 : ${user.size}人 (+ Bot${bot.size}台)
    ロール数 : ${(await guild.roles.fetch()).size}個 (上限250個)
    チャンネル数 : ${(await guild.channels.fetch()).size}個 (上限500個)`
            );
        } catch (error) {
            if (!(error instanceof GatewayRateLimitError)) {
                throw error;
            }
            await reply(interaction, generateGatewayLimitMessage(error.data.retry_after));
        }
    },
});
