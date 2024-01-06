import { AnyThreadChannel, Collection, DMChannel, GuildTextBasedChannel, Message, PartialDMChannel } from "discord.js";
import { arraySplit } from "./ArraySplit";

export const deleteMultiMessages = async (
    channel: GuildTextBasedChannel | DMChannel | PartialDMChannel,
    messages: Collection<string, Message<boolean>>
) => {
    const nonSystemMessages = messages.filter(message => !message.system);
    const threads = nonSystemMessages.filter(m => m.hasThread).map(m => m.thread as AnyThreadChannel);
    const [recentMessages, oldMessages] = nonSystemMessages.partition(
        message => Date.now() - message.createdTimestamp < 1_209_600_000
    );

    if (!("bulkDelete" in channel)) {
        //bulkDeleteがない場合は一つずつ削除
        await Promise.all(
            nonSystemMessages.map(async message => {
                await message.delete();
            })
        );
        return;
    }

    //bulkDeleteで100件ずつ削除
    await Promise.all(
        arraySplit([...recentMessages.values()], 100).map(async messagesSliced => channel.bulkDelete(messagesSliced))
    );

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(async message => message.delete()));

    //メッセージに付属するスレッドも削除
    await Promise.all(threads.map(async thread => thread.delete()));
};
