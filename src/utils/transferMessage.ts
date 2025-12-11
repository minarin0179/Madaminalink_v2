import {
    AnyThreadChannel,
    Attachment,
    AttachmentBuilder,
    BitFieldResolvable,
    GuildChannel,
    GuildTextBasedChannel,
    Message,
    MessageCreateOptions,
    MessageFlags,
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
import { MyConstants } from "../constants/constants";
import { createPollMessage } from "../commands/slashcommands/poll";
import { PollModel } from "../structures/Poll";

type transferOptions = {
    noReaction?: boolean;
    allowedMentions?: MessageMentionOptions;
    flags?: BitFieldResolvable<
        "SuppressEmbeds" | "SuppressNotifications",
        MessageFlags.SuppressEmbeds | MessageFlags.SuppressNotifications
    >;
    updates?: ChannelLink[]; //チャンネルリンク差し替え用
};

export const transferMessage = async (
    message: Message,
    destination: GuildTextBasedChannel,
    options?: transferOptions
) => {
    await destination.sendTyping();

    let contentAll = message.content;
    const { allowedMentions, updates, flags } = options ?? {};

    if (updates) {
        contentAll = replaceChannelLinks(contentAll, updates);
    }

    //2000文字を超えないように分割
    const contentSplit: string[] = splitMessage(contentAll);

    //最後の1チャンクだけ取り出して残りは先に送る
    const content = contentSplit.pop();
    for await (const msg of contentSplit) {
        await destination.send({ content: msg, allowedMentions, flags });
    }

    const { attachments, components, embeds } = message;

    //巨大なファイルを除外
    const [files, largeFiles] = attachments.partition((f: Attachment) => f.size <= MyConstants.maxFileSize);
    const attachmentFiles: (AttachmentBuilder | null)[] = await Promise.all(
        files.map(async (file: Attachment) => {
            const response = await fetch(file.url);
            if (!isFetchedFilesizeOK(response)) {
                largeFiles.set(file.id, file);
                return null;
            }
            const filename = decodeResponseFilename(response) ?? file.name ?? "unknown";
            return new AttachmentBuilder(file.url).setName(filename);
        })
    );
    const attachmentFilesFiltered: AttachmentBuilder[] = attachmentFiles.filter(file => file !== null);

    let newMessageOptions = {
        content,
        files: attachmentFilesFiltered,
        components,
        embeds,
        allowedMentions,
        flags,
    } as MessageCreateOptions;

    //transfer,open,pollのボタンを更新
    const customId = components[0]?.components[0]?.customId ?? '';

    if (message.author.id !== client.user?.id) {
        newMessageOptions.components = []; //自分以外のメッセージはcomponentsを削除
    } else if (customId?.startsWith("transfer")) {
        const [, destinationId] = customId.split(/[;:,]/);
        const destinationChannel = updates?.find(({ before }) => before.id == destinationId)?.after;

        if (destinationChannel) {
            newMessageOptions = { ...newMessageOptions, ...buildTransferMessage(destinationChannel) };
        }
    } else if (customId?.startsWith("open")) {
        const [, channelId, mentionableId] = customId.split(/[;:,]/);
        const targetChannel = updates?.find(({ before }) => before.id == channelId)?.after;
        const mentionable =
            message.guild?.roles.cache.get(mentionableId) ?? message.guild?.members.cache.get(mentionableId);
        if (targetChannel && mentionable) {
            newMessageOptions = { ...newMessageOptions, ...openMessage(targetChannel, mentionable) };
        }
    } else if (customId?.startsWith("poll")) {
        const [, pollId, _] = customId.split(/[;:,]/);
        const poll = await PollModel.findById(pollId);
        if (!poll) return;
        const options = {
            type: poll.type,
            ownerId: poll.ownerId,
            choices: poll.choices,
            voters: new Map(),
        };
        newMessageOptions = await createPollMessage(options);
    }
    try {
        const newMessage = await destination.send(newMessageOptions);

        if (message.pinned) await newMessage.pin();

        if (!options?.noReaction) {
            await Promise.all(
                [...message.reactions.cache.keys()].map(reaction => newMessage.react(reaction).catch(() => { }))
            );
        }
        const { thread } = message;
        if (thread && "threads" in destination) {
            const name = thread.name;
            const newThread =
                message.type == MessageType.ThreadCreated
                    ? await destination.threads.create({ name })
                    : await newMessage.startThread({ name });

            await transferAllMessages(thread, newThread, options);
        }
    } catch (e: any) {
        // emptyメッセージだったら無視
        if (e.code != 50006) {
            throw e;
        }
    }

    if (largeFiles.size > 0) {
        await destination.send(`\`\`\`diff
- ${largeFiles.map(file => file.name).join(", ")}のコピーに失敗しました
- ファイル容量の上限は${MyConstants.maxFileSizeMB}MBです\`\`\``);
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
    updates.forEach(({ before, after }) => {
        content = content.replace(new RegExp(`${before}`, "g"), `${after}`);
    });
    return content;
};

const decodeResponseFilename = (response: Response) => {
    try {
        if (!response) {
            return null;
        }
        if (!response.ok) {
            return null;
        }
        const contentDisposition = response.headers.get("Content-Disposition");
        if (!contentDisposition) {
            return null;
        }
        const filenameMatch = contentDisposition.match(/filename\*=UTF-8''(.+)$/);
        if (!filenameMatch) {
            return null;
        }
        const filename = decodeURIComponent(filenameMatch[1]);
        return filename;
    } catch (error) {
        return null;
    }
};

const isFetchedFilesizeOK = (response: Response) => {
    if (!response.ok) {
        return null;
    }
    const contentLength = response.headers.get("content-length");
    if (!contentLength) {
        return null;
    }
    return parseInt(contentLength) <= MyConstants.maxFileSize;
};
