import {
    CategoryChannel,
    ChannelType,
    Collection,
    discordSort,
    Embed,
    EmbedBuilder,
    GuildEmoji,
    GuildTextBasedChannel,
    Message,
    MessageFlags,
    MessageReaction,
    SlashCommandBuilder,
    TextChannel,
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

    const archiveDatas = messages.map(messageToArchiveDatas).flat();

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
            await destinationThread.send({
                files: [file],
                flags: MessageFlags.SuppressNotifications,
            });
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

    (await destinationThread.fetchStarterMessage())?.delete().catch(() => { });
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

const messageToArchiveDatas = (message: Message): ArchiveData[] => {
    const date = new Date(message.createdAt);
    const timeStamp = dateToTimestamp(date);

    const reactions = message.reactions.cache;

    let reactionText = "";
    let reactionTextLater = "";
    let reactionTextEmbed = "";

    if (message.embeds.length > 0) {
        reactionTextEmbed = reactionsToString(reactions);
    } else if (message.attachments.size > 0) {
        reactionTextLater = reactionsToString(reactions);
    } else {
        reactionText = reactionsToString(reactions);
    }

    const description = `${message.content}\n${reactionText}`;
    const authorName = message.member?.nickname || message.author.globalName || message.author.username;
    const splittedDescription = splitMessage(description, { maxLength: 3000 });
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
                iconURL: message.author.avatarURL() ?? undefined,
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
        ...message.embeds.map(embed => {
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
    ];

    if (!isEmptyText(reactionTextEmbed)) {
        result[result.length - 1].reactions = reactionTextEmbed;
    }

    return result;
};
