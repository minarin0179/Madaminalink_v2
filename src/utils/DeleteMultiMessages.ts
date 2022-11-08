import { Collection, DMChannel, GuildTextBasedChannel, Message, PartialDMChannel } from "discord.js";
import { arraySplit } from "./ArraySplit";

export const deleteMultiMessages = async (channel: GuildTextBasedChannel | DMChannel | PartialDMChannel, messages: Collection<string, Message<boolean>>) => {

    const [recentMessages, oldMessages] = messages.partition(message => (Date.now() - message.createdTimestamp) < 1_209_600_000);

    if ('bulkDelete' in channel) {
        await Promise.all(arraySplit(Array.from(recentMessages.values()), 100).map(async messagesSliced => {
            await channel.bulkDelete(messagesSliced)
        }))
    }

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(async message => {
        await message.delete();
    }));
}