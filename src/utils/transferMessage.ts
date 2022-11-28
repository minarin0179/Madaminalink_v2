import { ActionRow, ActionRowBuilder, Attachment, ButtonBuilder, GuildChannel, GuildTextBasedChannel, Message, MessageActionRowComponent, MessageMentionOptions, MessageType, PrivateThreadChannel, PublicThreadChannel } from "discord.js";
import { fetchAllMessages } from "./FetchAllMessages";
import { splitMessage } from "./SplitMessage";
import { buttonToRow } from "../utils/ButtonToRow";
import transferButton from "../components/buttons/transfer";
import { openMessage } from "../commands/slashcommands/open";


type transferOptions = {
    noReaction?: boolean,
    allowedMentions?: MessageMentionOptions,
    updates?: { [key: string]: GuildChannel } //チャンネルリンク差し替え用
}

export const transferMessage = async (message: Message, destination: GuildTextBasedChannel, options?: transferOptions) => {

    await destination.sendTyping();

    let contentAll = message.content
    const { allowedMentions, updates } = options ?? {}

    if (updates) {
        contentAll = replaceChannelLinks(contentAll, updates)
    }

    //2000文字を超えないように分割
    const contentSplit: string[] = splitMessage(contentAll)

    //最後の1チャンクだけ取り出して残りは先に送る
    let content = contentSplit.pop()
    for await (const msg of contentSplit) {
        await destination.send({ content: msg, allowedMentions })
    }

    const { attachments, embeds } = message

    let components: ActionRow<MessageActionRowComponent>[] | ActionRowBuilder<ButtonBuilder>[] = message.components

    //巨大なファイルを除外
    const [files, largeFiles] = attachments.partition((f: Attachment) => f.size < 0x8000000)

    //transfer/openの更新
    const customId = components[0]?.components[0]?.customId
    if (customId?.startsWith('transfer')) {
        const [prefix, destinationId] = customId?.split(/[;:,]/)
        const destination = updates?.[destinationId]
        if (destination) {
            components = buttonToRow(transferButton.build({ destination }))
        }
    } else if (customId?.startsWith('open')) {
        const [prefix, channelId, mentionableId] = customId?.split(/[;:,]/)
        const channel = updates?.[channelId]
        const mentionable = message.guild?.roles.cache.get(mentionableId) ?? message.guild?.members.cache.get(mentionableId)
        if (channel && mentionable) {
            ({ content, components } = openMessage(channel, mentionable))
        }
    }
    try {
        const newMessage = await destination.send({
            content,
            files: files.map((file: Attachment) => file.url),
            components,
            embeds,
            allowedMentions
        })

        for await (const file of largeFiles.values()) {
            await destination.send(`\\\\\\diff
- ${file.name}のコピーに失敗しました
- ファイル容量の上限は8MBです\\\\\\`)
        }

        if (message.pinned) await newMessage.pin()

        if (!options?.noReaction) {
            for await (const reaction of message.reactions.cache.keys())
                newMessage.react(reaction)
        }
        if (message.thread && "threads" in destination) {
            const name = message.thread.name
            const newThread = (message.type == MessageType.ThreadCreated ?
                await destination.threads.create({ name }) :
                await newMessage.startThread({ name, })) as PublicThreadChannel | PrivateThreadChannel
            await transferAllMessages(message.thread, newThread)
        }
    } catch (e: any) {
        // emptyメッセージだったら無視 
        if (e.code != 50006) {
            throw e
        }
    }
}

export const transferAllMessages = async (from: GuildTextBasedChannel, to: GuildTextBasedChannel, options?: transferOptions) => {
    const messages = (await fetchAllMessages(from)).reverse()
    for await (const message of messages.values()) {
        await transferMessage(message, to, options)
    }
}

const replaceChannelLinks = (content: string, updates: { [key: string]: GuildChannel }) => {
    Object.keys(updates).map((key: string) => {
        content = content.replace(new RegExp(`<#${key}>`, 'g'), `${updates[key]}`)
    })
    return content
}
