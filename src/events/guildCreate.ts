import { AuditLogEvent, Events } from "discord.js";
import { Event } from "../structures/Events";

export default new Event(Events.GuildCreate, async (guild) => {
    try {
        const owner = await guild.fetchOwner();
        const auditLogs = await guild.fetchAuditLogs({ type: AuditLogEvent.BotAdd, limit: 1 });
        const botAddLog = auditLogs.entries.first();
        const inviter = botAddLog?.executor || null;

        const message =
            `この度は\`${guild}\`にマダミナリンクを導入頂きありがとうございます！\n` +
            `使い方に関しては[こちら](https://docs.madaminalink.com/)をご覧ください.\n` +
            `※もしBotの導入に心当たりがない場合は、速やかにサーバーからキックしてください.`;

        // Send DM to the server owner
        await owner.send(message);

        // Send DM to the user who added the bot (if available)
        if (inviter && inviter.id !== owner.id) {
            await inviter.send(message);
        }
    } catch (error) {
        console.error(`DM送信中にエラーが発生しました: ${error}`);
    }
});
