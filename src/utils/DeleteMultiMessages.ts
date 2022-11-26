import { AnyThreadChannel, Collection, DMChannel, GuildTextBasedChannel, Message, PartialDMChannel, ThreadChannel } from "discord.js";
import { arraySplit } from "./ArraySplit";

export const deleteMultiMessages = async (channel: GuildTextBasedChannel | DMChannel | PartialDMChannel, messages: Collection<string, Message<boolean>>) => {

    const threads = messages.filter(m => m.hasThread).map(m => m.thread as AnyThreadChannel)
    const [recentMessages, oldMessages] = messages.partition(message => (Date.now() - message.createdTimestamp) < 1_209_600_000);

    if (!('bulkDelete' in channel)) {
        //bulkDeleteがない場合は一つずつ削除
        await Promise.all(messages.map(async message => {
            await message.delete();
        }));
        return
    }

    //bulkDeleteで100件ずつ削除
    await Promise.all(arraySplit([...recentMessages.values()], 100).map(async messagesSliced => {
        await channel.bulkDelete(messagesSliced)
    }))

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(async message => {
        await message.delete();
    }));

    //メッセージに付属するスレッドも削除
    await Promise.all(threads.map(async thread => {
        await thread.delete()
    }))
}