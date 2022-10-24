import { Collection, Message, TextBasedChannel } from "discord.js"

export const fetchAllMessages = async (channel: TextBasedChannel) => {
    let messages = new Collection<string, Message>()
    let lastId: string | undefined
    while (true) {
        channel.messages.cache.clear()
        const fetched = await channel.messages.fetch({ limit: 100, before: lastId })
        if (fetched.size == 0) break
        messages = messages.concat(fetched)
        lastId = fetched.last()?.id
    }
    return messages
}