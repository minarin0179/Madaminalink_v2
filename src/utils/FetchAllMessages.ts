import { Collection, Message, Snowflake, TextBasedChannel } from "discord.js"

type fetchOptions = {
    before?: Snowflake,
    after?: Snowflake,
}

export const fetchAllMessages = async (channel: TextBasedChannel, { before, after }: fetchOptions = {}) => {
    const border = before ?? after ?? undefined
    let messages: Collection<string, Message<boolean>> = new Collection(border ? [[border, await channel.messages.fetch(border)]] : undefined)

    while (true) {
        channel.messages.cache.clear()
        //afterが指定されている場合は、beforeが無視される
        const fetched: Collection<string, Message> = await channel.messages.fetch({ limit: 100, before, after })
        if (fetched.size == 0) break

        if (after) {
            messages = fetched.concat(messages)
            after = fetched.first()?.id
        } else {
            messages = messages.concat(fetched)
            before = fetched.last()?.id
        }
    }
    return messages
}
/* 
export const fetchBeforeMessages = async (channel: TextBasedChannel, before?: Message) => {
    let messages = new Collection(before ? [[before.id, before]] : undefined)
    let lastId: string | undefined = before?.id
    while (true) {
        channel.messages.cache.clear()
        const fetched: Collection<string, Message> = await channel.messages.fetch({ limit: 100, before: lastId })
        if (fetched.size == 0) break
        messages = messages.concat(fetched)
        lastId = fetched.last()?.id
    }
    return messages
}


export const fetchAfterMessages = async (channel: TextBasedChannel, after?: Message) => {
    let messages = new Collection(after ? [[after.id, after]] : undefined)
    let lastId: string | undefined = after?.id
    while (true) {
        channel.messages.cache.clear()
        const fetched: Collection<string, Message> = await channel.messages.fetch({ limit: 100, after: lastId })
        if (fetched.size == 0) break
        messages = fetched.concat(messages)
        lastId = fetched.first()?.id
    }
    return messages
}

 */