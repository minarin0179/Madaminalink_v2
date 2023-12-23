import {
    CategoryChannel,
    ChannelType,
    Collection,
    discordSort,
    EmbedBuilder,
    GuildEmoji,
    GuildTextBasedChannel,
    Message,
    SlashCommandBuilder,
    TextChannel,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";
import { arraySplit } from "../../utils/ArraySplit";
import { splitMessage } from "../../utils/SplitMessage";

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

const RunArchive = async (source: GuildTextBasedChannel, destination: TextChannel): Promise<string> => {
    const messages = [...(await fetchAllMessages(source)).reverse().values()];
    const slicedMessages: Message[][] = [];
    const destinationThread = await destination.threads.create({ name: source.name });

    const embedSize = (message: Message) =>
        message.content.length + (message.member?.nickname || message.author.username).length + 16;
    let tail = 0;
    let length = 0;
    messages.map((message, index) => {
        if (index - tail == 9 || message.attachments.size > 0 || length + embedSize(message) > 4000) {
            slicedMessages.push(messages.slice(tail, index + 1));
            tail = index + 1;
            length = 0;
        }
        length += embedSize(message);
    });

    if (tail < messages.length) {
        slicedMessages.push(messages.slice(tail));
    }

    for await (const messages of slicedMessages) {
        await destinationThread.sendTyping();

        const embeds = messages
            .filter(message => message.content != "")
            .map(message => {
                const date = new Date(message.createdAt);
                const timeStamp = dateToTimestamp(date);

                const reactions = message.reactions.cache;
                const reactionText = reactions
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

                const description = `${message.content}\n${reactionText}`
                const authorName = message.member?.nickname || message.author.globalName || message.author.username;

                return new EmbedBuilder()
                    .setAuthor({
                        name: authorName,
                        iconURL: message.author.avatarURL() ?? undefined,
                    })
                    .setColor([47, 49, 54])
                    .setDescription(description)
                    .setFooter({ text: timeStamp });
            });

        if (embeds.length > 0) {
            await destinationThread.send({ embeds: embeds });
        }

        const files = messages
            .slice(-1)[0]
            .attachments.filter(attachment => attachment.size <= 8388608)
            .map(attachment => attachment.url);

        //ファイルを一括で送るとメモリを食う
        for await (const file of files) {
            await destinationThread.sendTyping();
            await destinationThread.send({ files: [file] });
        }
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
}
