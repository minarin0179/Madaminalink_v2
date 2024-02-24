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
        await interaction.deferReply({ ephemeral: true });

        const targetCategory = args.getChannel<ChannelType.GuildCategory | ChannelType.GuildText>("保存するカテゴリ", true);

        const logChannel = args.getChannel<ChannelType.GuildText>("保存先") ??
            await interaction.guild?.channels.create({
                name: `ログ ${targetCategory.name}`,
                type: ChannelType.GuildText,
                permissionOverwrites: targetCategory.permissionOverwrites.cache,
            });

        if (!logChannel) {
            return reply(interaction, { content: "保存先のチャンネルが見つかりません", ephemeral: true });
        }

        const children = (targetCategory instanceof CategoryChannel)
            ? discordSort(targetCategory.children.cache.filter((ch): ch is TextChannel => ch.type === ChannelType.GuildText))
            : new Collection<string, TextChannel>([[targetCategory.id, targetCategory]]);
        if (children.size == 0) {
            return reply(interaction, { content: "保存するチャンネルがありません", ephemeral: true });
        }

        const descriptions = await Promise.all(
            children.map(async child => {
                let description = "";

                description += await RunArchive(child, logChannel);

                const threads = (await child.threads.fetchActive()).threads.concat(
                    (await child.threads.fetchArchived()).threads
                );
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
                    const embedBuilder = new EmbedBuilder().setColor([47, 49, 54]).setDescription(description);
                    if (index == 0) {
                        embedBuilder.setTitle(targetCategory.name);
                    }
                    return embedBuilder;
                }),
            });
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

    const archiveDatas: ArchiveData[] = messages.map(message => {
        const date = new Date(message.createdAt);
        const timeStamp = dateToTimestamp(date);

        const reactions = message.reactions.cache;
        const [reactionText, reactionTextLater] = (message.attachments.size > 0)
            ? ["", reactionsToString(reactions)] //添付ファイルがある場合はリアクションは後で送る
            : [reactionsToString(reactions), ""];

        const description = `${message.content}\n${reactionText}`
        const authorName = message.member?.nickname || message.author.globalName || message.author.username;

        const messageEmbed = new EmbedBuilder()
            .setAuthor({
                name: authorName,
                iconURL: message.author.avatarURL() ?? undefined,
            })
            .setColor([47, 49, 54])
            .setDescription(description)
            .setFooter({ text: timeStamp });

        const data: ArchiveData = {
            embed: messageEmbed,
            files: message.attachments.filter(attachment => attachment.size <= MyConstants.maxFileSize).map(attachment => attachment.url) || [],
            reactions: reactionTextLater
        };
        return [data, ...message.embeds.map(embed => ({ embed: embed, files: [], reactions: "" }))];
    }).flat();

    let lastIndex = 0;
    let embedSize = 0;

    for await (const [index, data] of archiveDatas.entries()) {
        embedSize += data.embed.length;

        if (
            data.files.length == 0 // ファイルがあれば区切る
            && index - lastIndex < 9 //一つのメッセージにつきembedは10個まで
            && index != archiveDatas.length - 1 // 最後まで到達したら送る
            && embedSize + archiveDatas[index + 1].embed.length < 6000 // 一つのメッセージにつきembedは6000文字まで
        ) continue;

        const slicedDatas = archiveDatas.slice(lastIndex, index + 1);
        const embeds = slicedDatas.map(data => data.embed);
        await destinationThread.send({ embeds: embeds });

        for await (const file of data.files) {
            await destinationThread.send({ files: [file] });
        }

        if (!isEmptyText(data.reactions)) {
            await destinationThread.send(data.reactions);
        }

        lastIndex = index + 1;
        embedSize = 0;
    };

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
}

const reactionsToString = (reactions: Collection<string, MessageReaction>) => {
    return reactions
        .map(reaction => {
            const { emoji, count } = reaction;
            //idが存在する場合はカスタム絵文字
            if (emoji.id) {
                return (emoji instanceof GuildEmoji) ? `${emoji} ${count}` : ""; //絵文字がサーバーにない場合は空文字
            } else {
                return `\`${emoji} ${count}\``;
            }
        })
        .join(" ");
};
