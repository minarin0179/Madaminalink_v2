import { InteractionContextType, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { ensureMembers } from "../../utils/ensureMembers";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("server")
        .setDescription("メンバー数、ロール数、チャンネル数を表示します")
        .setContexts(InteractionContextType.Guild),

    execute: async ({ interaction }) => {
        const guild = interaction.guild;
        if (!guild) return;

        // 3秒以内に応答しないとインタラクションが失効するため、メンバー取得より先に保留する
        await interaction.deferReply({ ephemeral: true });

        const members = await ensureMembers(guild);
        const [bot, user] = members.partition(member => member.user.bot);
        // ロール・チャンネルはGuilds intentでキャッシュ済みのためAPIを呼ばない
        // スレッドはチャンネル数の上限に含まれないため除外する
        const roleCount = guild.roles.cache.size;
        const channelCount = guild.channels.cache.filter(channel => !channel.isThread()).size;

        await reply(
            interaction,
            `
    メンバー数 : ${user.size}人 (+ Bot${bot.size}台)
    ロール数 : ${roleCount}個 (上限250個)
    チャンネル数 : ${channelCount}個 (上限500個)`
        );
    },
});
