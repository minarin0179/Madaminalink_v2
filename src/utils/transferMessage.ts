import {
    ActionRow,
    ActionRowBuilder,
    AnyThreadChannel,
    Attachment,
    ButtonBuilder,
    GuildChannel,
    GuildTextBasedChannel,
    Message,
    MessageActionRowComponent,
    MessageMentionOptions,
    MessageType,
    ThreadChannel,
} from "discord.js";
import { fetchAllMessages } from "./FetchAllMessages";
import { splitMessage } from "./SplitMessage";
import { openMessage } from "../commands/slashcommands/open";
import { client } from "../bot";
import { ChannelLink } from "../structures/ChannelLink";
import { buildTransferMessage } from "../commands/slashcommands/transfer";

type transferOptions = {
    noReaction?: boolean;
    allowedMentions?: MessageMentionOptions;
    updates?: ChannelLink[]; //チャンネルリンク差し替え用
};

export const transferMessage = async (
    message: Message,
    destination: GuildTextBasedChannel,
    options?: transferOptions
) => {
    await destination.sendTyping();

    let contentAll = message.content;
    const { allowedMentions, updates } = options ?? {};

    if (updates) {
        contentAll = replaceChannelLinks(contentAll, updates);
    }

    //2000文字を超えないように分割
    const contentSplit: string[] = splitMessage(contentAll);

    //最後の1チャンクだけ取り出して残りは先に送る
    let content = contentSplit.pop();
    for await (const msg of contentSplit) {
        await destination.send({ content: msg, allowedMentions });
    }

    const { attachments, embeds } = message;

    //巨大なファイルを除外
    const [files, largeFiles] = attachments.partition((f: Attachment) => f.size < 0x8000000);

    let components: ActionRow<MessageActionRowComponent>[] | ActionRowBuilder<ButtonBuilder>[] = message.components;

    //transfer,openのボタンを更新
    const customId = components[0]?.components[0]?.customId;

    if (message.author.id !== client.user?.id) {
        components = []; //自分以外のメッセージはcomponentsを削除
    } else if (customId?.startsWith("transfer")) {
        const [, destinationId] = customId?.split(/[;:,]/);
        const destinationChannel = updates?.find(({ before }) => before.id == destinationId)?.after;

        if (destinationChannel) {
            ({ content, components } = buildTransferMessage(destinationChannel));
        }
    } else if (customId?.startsWith("open")) {
        const [, channelId, mentionableId] = customId?.split(/[;:,]/);
        const targetChannel = updates?.find(({ before }) => before.id == channelId)?.after;
        const mentionable =
            message.guild?.roles.cache.get(mentionableId) ?? message.guild?.members.cache.get(mentionableId);
        if (targetChannel && mentionable) {
            ({ content, components } = openMessage(targetChannel, mentionable));
        }
    }
    try {
        const newMessage = await destination.send({
            content,
            files: files.map((file: Attachment) => file.url),
            components,
            embeds,
            allowedMentions,
        });

        for await (const file of largeFiles.values()) {
            await destination.send(`\\\\\\diff
- ${file.name}のコピーに失敗しました
- ファイル容量の上限は8MBです\\\\\\`);
        }

        if (message.pinned) await newMessage.pin();

        if (!options?.noReaction) {
            for await (const reaction of message.reactions.cache.keys()) newMessage.react(reaction);
        }
        const { thread } = message;
        if (thread && "threads" in destination) {
            const name = thread.name;
            const newThread =
                message.type == MessageType.ThreadCreated
                    ? await destination.threads.create({ name })
                    : await newMessage.startThread({ name });

            await transferAllMessages(thread, newThread);
        }
    } catch (e: any) {
        // emptyメッセージだったら無視
        if (e.code != 50006) {
            throw e;
        }
    }
};

export const transferAllMessages = async (
    from: GuildChannel | AnyThreadChannel,
    to: GuildChannel | ThreadChannel,
    options?: transferOptions
) => {
    if (!from.isTextBased() || !to.isTextBased()) return;
    const messages = (await fetchAllMessages(from)).reverse();
    for await (const message of messages.values()) {
        await transferMessage(message, to, options);
    }
};

const replaceChannelLinks = (content: string, updates: ChannelLink[]) => {
    updates.map(({ before, after }) => {
        content = content.replace(new RegExp(`${before}`, "g"), `${after}`);
    });
    return content;
};
