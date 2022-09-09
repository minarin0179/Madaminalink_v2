import { Attachment, GuildTextBasedChannel, Message, MessageType } from "discord.js";
import { fetchAllMessages } from "./FetchAllMessages";
import { splitMessage } from "./SplitMessage";

export const transferMessage = async (message: Message, destination: GuildTextBasedChannel, noReaction: boolean = false) => {

    await destination.sendTyping();

    //2000文字を超えないように分割
    const contentSplit: string[] = splitMessage(message.content)
    //最後の1チャンクだけ取り出して残りは先に送る
    const content = contentSplit.pop()
    for await (const msg of contentSplit) {
        await destination.send({ content: msg, allowedMentions: { parse: [] } })
    }

    const { attachments, components, embeds } = message

    const [files, largeFiles] = attachments.partition((f: Attachment) => f.size < 0x8000000)

    const newMessage = await destination.send({
        content,
        files: files.map((file: Attachment) => file.url),
        components,
        embeds,
        allowedMentions: { parse: [] },
    }).catch(e => { throw e })

    for await (const file of largeFiles.values()) {
        await destination.send(`\\\\\\diff
- ${file.name}のコピーに失敗しました
- ファイル容量の上限は8MBです\\\\\\`)
    }

    if (message.pinned) await newMessage.pin()

    if (!noReaction) {
        for await (const reaction of message.reactions.cache.keys())
            newMessage.react(reaction)
    }

    if (message.thread && "threads" in destination) {
        const name = message.thread.name
        const newThread = message.type == MessageType.ThreadCreated ?
            await destination.threads.create({ name }) :
            await newMessage.startThread({ name })
        await transferAllMessages(message.thread, newThread)
    }
}

export const transferAllMessages = async (from: GuildTextBasedChannel, to: GuildTextBasedChannel) => {
    const messages = (await fetchAllMessages(from)).reverse()
    for await (const message of messages.values()) {
        if (message.system) continue
        transferMessage(message, to)
    }
}