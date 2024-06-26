import { AnyThreadChannel, Collection, DMChannel, GuildTextBasedChannel, Message, PartialDMChannel } from "discord.js";
import { arraySplit } from "./ArraySplit";

export const deleteMultiMessages = async (
    channel: GuildTextBasedChannel | DMChannel | PartialDMChannel,
    messages: Collection<string, Message<boolean>>
) => {
    const nonSystemMessages = messages.filter(message => !message.system);

    if (!("bulkDelete" in channel)) {
        //bulkDeleteがない場合は一つずつ削除
        await Promise.all(nonSystemMessages.map(message => message.delete()));
        return;
    }

    const [recentMessages, oldMessages] = nonSystemMessages.partition(message => message.bulkDeletable);

    //bulkDeleteで100件ずつ削除
    await Promise.all(
        arraySplit([...recentMessages.values()], 100).map(messagesSliced => channel.bulkDelete(messagesSliced))
    );

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(message => message.delete()));

    //メッセージに付属するスレッドも削除
    const threads = nonSystemMessages.map(m => m.thread).filter((t): t is AnyThreadChannel => !!t);
    await Promise.all(threads.map(thread => thread.delete()));
};
