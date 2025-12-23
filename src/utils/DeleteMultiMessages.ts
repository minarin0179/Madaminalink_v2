import type {
    AnyThreadChannel,
    Collection,
    DiscordAPIError,
    DMChannel,
    GuildTextBasedChannel,
    Message,
    PartialDMChannel,
} from "discord.js";
import { arraySplit } from "./ArraySplit";

export const deleteMultiMessages = async (
    channel: GuildTextBasedChannel | DMChannel | PartialDMChannel,
    messages: Collection<string, Message<boolean>>
) => {
    if (!("bulkDelete" in channel)) {
        //bulkDeleteがない場合は一つずつ削除
        await Promise.all(messages.map(message => message.delete()));
        return;
    }

    const [recentMessages, oldMessages] = messages.partition(
        message => message.bulkDeletable
    );

    const handleSystemMessage = (error: DiscordAPIError) => {
        if (error.code !== 50021) {
            //削除できないシステムメッセージは無視
            throw error;
        }
    };
    //bulkDeleteで100件ずつ削除
    await Promise.all(
        arraySplit([...recentMessages.values()], 100).map(messagesSliced =>
            channel.bulkDelete(messagesSliced)
        )
    ).catch(handleSystemMessage);

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(message => message.delete())).catch(
        handleSystemMessage
    );

    //メッセージに付属するスレッドも削除
    const threads = messages
        .map(m => m.thread)
        .filter((t): t is AnyThreadChannel => !!t);
    await Promise.all(threads.map(thread => thread.delete())).catch(
        handleSystemMessage
    );
};
