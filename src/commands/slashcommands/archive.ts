import {
    CategoryChannel,
    ChannelType,
    Collection,
    discordSort,
    Embed,
    EmbedBuilder,
    EmbedType,
    GuildEmoji,
    GuildTextBasedChannel,
    Message,
    MessageFlags,
    MessageReaction,
    MessageType,
    Poll,
    SlashCommandBuilder,
    TextChannel,
    ThreadChannel,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";
import { arraySplit } from "../../utils/ArraySplit";
import { splitMessage } from "../../utils/SplitMessage";
import { isEmptyText } from "../../utils/isEmptyMessage";
import { MyConstants } from "../../constants/constants";

const MAX_DESCRIPTION_LENGTH = 2500;
const MAX_EMBED_LENGTH = 3000;
const MAX_FILE_SEND_RETRIES = 3;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// 添付ファイルのダウンロード時に発生する一時的なソケットエラー(discord.js内部でCDNから再取得する際に発生)をリトライで吸収する
const sendFileWithRetry = async (thread: ThreadChannel, file: string) => {
    for (let attempt = 1; attempt <= MAX_FILE_SEND_RETRIES; attempt++) {
        try {
            await thread.send({ files: [file], flags: MessageFlags.SuppressNotifications });
            return;
        } catch (e: any) {
            if (e.code == 40005) return; // Request entity too large は無視
            if (attempt == MAX_FILE_SEND_RETRIES) throw e;
            await sleep(1000 * attempt);
        }
    }
};

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("archive")
        .setDescription("チャンネルをスレッドにして保存します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .setName("保存するカテゴリ")
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory)
                .setDescription("保存するカテゴリ")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .addChannelTypes(ChannelType.GuildText)
                .setName("保存先")
                .setDescription("保存先のチャンネル")
                .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        const progressMessage = await reply(interaction, "処理を実行中です...");

        const targetCategory = args.getChannel<ChannelType.GuildCategory | ChannelType.GuildText>(
            "保存するカテゴリ",
            true
        );

        const logChannel =
            args.getChannel<ChannelType.GuildText>("保存先") ??
            (await interaction.guild?.channels.create({
                name: `ログ ${targetCategory.name}`.substring(0, 100),
                type: ChannelType.GuildText,
                permissionOverwrites: targetCategory.permissionOverwrites.cache,
            }));

        if (!logChannel) {
            return reply(interaction, { content: "保存先のチャンネルが見つかりません", ephemeral: true });
        }

        const children =
            targetCategory instanceof CategoryChannel
                ? discordSort(
                      targetCategory.children.cache.filter((ch): ch is TextChannel => ch.type === ChannelType.GuildText)
                  )
                : new Collection<string, TextChannel>([[targetCategory.id, targetCategory]]);
        if (children.size == 0) {
            return reply(interaction, { content: "保存するチャンネルがありません", ephemeral: true });
        }

        const descriptions = await Promise.all(
            children.map(async child => {
                let description = "";

                description += await RunArchive(child, logChannel);

                const threads = await fetchAllThreads(child);
                if (threads.size > 0) {
                    const threadDescription = await Promise.all(threads.map(thread => RunArchive(thread, logChannel)));
                    description += `\n${threadDescription.join("\n")}`;
                }
                return description;
            })
        );

        const descriptionsConcat: string[][] = arraySplit(
            splitMessage(descriptions.join("\n"), { maxLength: 2000 }),
            10
        );

        for await (const descriptions of descriptionsConcat) {
            await logChannel.send({
                embeds: descriptions.map((description, index) => {
                    const embedBuilder = new EmbedBuilder()
                        .setColor(MyConstants.color.embed_background)
                        .setDescription(description);
                    if (index == 0) {
                        embedBuilder.setTitle(targetCategory.name);
                    }
                    return embedBuilder;
                }),
                flags: MessageFlags.SuppressNotifications,
            });
        }

        if (progressMessage) {
            await progressMessage.delete();
        }
        await reply(interaction, `「${targetCategory.name}」の保存が完了しました`);
    },
});

interface ArchiveData {
    embed: EmbedBuilder | Embed;
    files: string[];
    reactions: string;
}

const RunArchive = async (source: GuildTextBasedChannel, destination: TextChannel): Promise<string> => {
    const messages = [...(await fetchAllMessages(source)).reverse().values()];
    const destinationThread = await destination.threads.create({ name: source.name });

    const archiveDatas = (await Promise.all(messages.map(messageToArchiveDatas))).flat();

    let lastIndex = 0;
    let embedSize = 0;

    for await (const [index, data] of archiveDatas.entries()) {
        embedSize += data.embed.length;

        if (
            data.files.length == 0 && // ファイルがあれば区切る
            data.reactions == "" && // リアクションがあれば区切る
            index - lastIndex < 9 && //一つのメッセージにつきembedは10個まで
            index != archiveDatas.length - 1 && // 最後まで到達したら送る
            embedSize + archiveDatas[index + 1].embed.length < MAX_EMBED_LENGTH // 一つのメッセージにつきembedは6000文字まで
        ) {
            continue;
        }

        const slicedDatas = archiveDatas.slice(lastIndex, index + 1);
        const embeds = slicedDatas.map(data => data.embed);
        await destinationThread.send({
            embeds: embeds,
            flags: MessageFlags.SuppressNotifications,
        });

        for await (const file of data.files) {
            try {
                await sendFileWithRetry(destinationThread, file);
            } catch (e: any) {
                // 添付ファイルの再アップロードに失敗しても保存処理全体は継続する(通信エラー等でも他のメッセージへ影響させない)
                // eslint-disable-next-line no-console
                console.error(`添付ファイルの保存に失敗しました: ${file}`, e);
                await destinationThread
                    .send({
                        content: "⚠️ 添付ファイルの保存に失敗しました",
                        flags: MessageFlags.SuppressNotifications,
                    })
                    .catch(() => {});
            }
        }

        if (!isEmptyText(data.reactions)) {
            await destinationThread.send({
                content: data.reactions,
                flags: MessageFlags.SuppressNotifications,
            });
        }

        lastIndex = index + 1;
        embedSize = 0;
    }

    (await destinationThread.fetchStarterMessage())?.delete().catch(() => {});
    await destinationThread.setArchived(true);

    return (source.isThread() ? "┗" : "") + `[_#_ ${destinationThread.name}](${destinationThread.url})`;
};

const dateToTimestamp = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = String(date.getHours()).padStart(2, "0");
    const minute = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} ${hour}:${minute}`;
};

const reactionsToString = (reactions: Collection<string, MessageReaction>) => {
    return reactions
        .map(reaction => {
            const { emoji, count } = reaction;
            //idが存在する場合はカスタム絵文字
            if (emoji.id) {
                return emoji instanceof GuildEmoji ? `${emoji} ${count}` : ""; //絵文字がサーバーにない場合は空文字
            } else {
                return `\`${emoji} ${count}\``;
            }
        })
        .join(" ");
};

const pollToEmbed = (poll: Poll, meta?: { authorName: string; iconURL?: string; timeStamp: string }): EmbedBuilder => {
    const totalVotes = poll.answers.reduce((sum, answer) => sum + answer.voteCount, 0);
    const maxVotes = Math.max(0, ...poll.answers.map(answer => answer.voteCount));
    const answerLines = poll.answers.map(answer => {
        // カスタム絵文字はサーバーの絵文字キャッシュに無いとdiscord.jsが不完全なEmoji情報を作ってしまいプレビューできないため、GuildEmojiとして解決できた場合のみ表示する(Unicode絵文字はidを持たずこの問題が無いためそのまま表示)
        const emoji =
            answer.emoji && (!answer.emoji.id || answer.emoji instanceof GuildEmoji) ? `${answer.emoji} ` : "";
        const percentage = totalVotes > 0 ? Math.round((answer.voteCount / totalVotes) * 100) : 0;
        const winnerMark = poll.resultsFinalized && maxVotes > 0 && answer.voteCount === maxVotes ? " ✅" : "";
        return `${emoji}${answer.text ?? ""} — ${answer.voteCount}票 (${percentage}%)${winnerMark}`;
    });
    const voteSummary = `合計${totalVotes}票${poll.allowMultiselect ? " ・複数選択可" : ""}${poll.resultsFinalized ? " ・終了済み" : " ・受付中"}`;

    const embed = new EmbedBuilder()
        .setColor(MyConstants.color.embed_background)
        .setTitle(`📊 ${poll.question.text ?? ""}`)
        .setDescription(`${answerLines.join("\n") || "(選択肢なし)"}\n\n${voteSummary}`);

    if (meta) {
        // 投票本体にテキスト本文が無い場合、投稿者情報をこのEmbedにまとめる(空の本文Embedと分離させない)
        embed.setAuthor({ name: meta.authorName, iconURL: meta.iconURL });
        embed.setFooter({ text: meta.timeStamp });
    }

    return embed;
};

const fetchAllThreads = async (channel: TextChannel) => {
    const activeThreads = await channel.threads.fetchActive();
    const archivedPublicThreads = await channel.threads.fetchArchived({
        type: "public",
        fetchAll: true,
    });
    const archivedPrivateThreads = await channel.threads.fetchArchived({
        type: "private",
        fetchAll: true,
    });

    const allThreads = activeThreads.threads.concat(archivedPublicThreads.threads, archivedPrivateThreads.threads);

    return allThreads.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
};

const messageToArchiveDatas = async (message: Message): Promise<ArchiveData[]> => {
    if (message.type === MessageType.PollResult) return []; //投票終了時にDiscordが自動生成するお知らせメッセージは保存しない(投票結果は投票本体のメッセージ側で保存される)

    let poll = message.poll;
    if (poll && !poll.resultsFinalized) {
        // Poll#fetch()はキャッシュ済みメッセージがあるとAPIを叩かず何もしないため、force:trueで明示的に再取得する
        const freshMessage = await message.channel.messages
            .fetch({ message: message.id, force: true })
            .catch(() => null);
        poll = freshMessage?.poll ?? poll;
    }

    const date = new Date(message.createdAt);
    const timeStamp = dateToTimestamp(date);

    const reactions = message.reactions.cache;

    let reactionText = "";
    let reactionTextLater = "";
    let reactionTextEmbed = "";

    if (message.embeds.length > 0 || poll) {
        reactionTextEmbed = reactionsToString(reactions);
    } else if (message.attachments.size > 0) {
        reactionTextLater = reactionsToString(reactions);
    } else {
        reactionText = reactionsToString(reactions);
    }

    const description = `${message.content}\n${reactionText}`;
    const authorName = message.member?.nickname || message.author.globalName || message.author.username;
    const iconURL = message.author.avatarURL() ?? undefined;
    // 投票のみでテキスト本文が無いメッセージは、本文用の空Embedを作らずPoll側のEmbedに投稿者情報をまとめる
    const hasVisibleContent = !isEmptyText(message.content) || message.attachments.size > 0;
    const splittedDescription = hasVisibleContent ? splitMessage(description, { maxLength: 3000 }) : [];
    const datas: ArchiveData[] = splittedDescription.map((description, index) => {
        const messageEmbed = new EmbedBuilder()
            .setDescription(description)
            .setColor(MyConstants.color.embed_background);
        const data: ArchiveData = {
            embed: messageEmbed,
            files: [],
            reactions: "",
        };

        if (index == 0) {
            messageEmbed.setAuthor({
                name: authorName,
                iconURL,
            });
        }
        if (index == splittedDescription.length - 1) {
            messageEmbed.setFooter({ text: timeStamp });
            data.files =
                message.attachments
                    .filter(attachment => attachment.size <= MyConstants.maxFileSize)
                    .map(attachment => attachment.url) || [];
            data.reactions = reactionTextLater;
        }
        return data;
    });
    const result = [
        ...datas,
        ...message.embeds
            .filter(embed => embed.data.type !== EmbedType.PollResult) // 投票終了時にDiscordが自動生成するEmbedは生フィールドしか持たないため除外
            .map(embed => {
                const { description } = embed;
                const newEmbed = new EmbedBuilder(embed);
                if (description) {
                    if (description?.length > MAX_DESCRIPTION_LENGTH) {
                        newEmbed.setDescription(description.substring(0, MAX_DESCRIPTION_LENGTH - 1) + "…");
                    } else {
                        newEmbed.setDescription(description);
                    }
                }

                return {
                    embed: newEmbed,
                    files: [],
                    reactions: "",
                };
            }),
        ...(poll
            ? [
                  {
                      embed: pollToEmbed(poll, hasVisibleContent ? undefined : { authorName, iconURL, timeStamp }),
                      files: [],
                      reactions: "",
                  },
              ]
            : []),
    ];

    if (!isEmptyText(reactionTextEmbed)) {
        result[result.length - 1].reactions = reactionTextEmbed;
    }

    return result;
};
