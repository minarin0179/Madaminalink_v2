import { Collection, Message, Snowflake, TextBasedChannel } from "discord.js";

type fetchOptions = {
    before?: Snowflake;
    after?: Snowflake;
};

export const fetchAllMessages = async (channel: TextBasedChannel, { before, after }: fetchOptions = {}) => {
    const border = before ?? after ?? undefined;
    let messages: Collection<string, Message<boolean>> = new Collection(
        border ? [[border, await channel.messages.fetch(border)]] : undefined
    );

    while (true) {
        channel.messages.cache.clear();
        //afterが指定されている場合は、beforeが無視される
        const fetched: Collection<string, Message> = await channel.messages.fetch({ limit: 100, before, after });
        if (fetched.size == 0) break;

        if (after) {
            messages = fetched.concat(messages);
            after = fetched.first()?.id;
        } else {
            messages = messages.concat(fetched);
            before = fetched.last()?.id;
        }
    }
    return messages;
};
