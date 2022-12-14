import { CategoryChannel, ChannelType, Collection, discordSort, EmbedBuilder, GuildTextBasedChannel, Message, MessageType, SlashCommandBuilder, TextBasedChannel, TextChannel, ThreadChannel, User } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('チャンネルをスレッドにして保存します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('保存するカテゴリ')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory)
            .setDescription('保存するカテゴリ')
            .setRequired(true)
        ).addChannelOption(option => option
            .addChannelTypes(ChannelType.GuildText)
            .setName('保存先')
            .setDescription('保存先のチャンネル')
            .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })

        const targetCategory = args.getChannel('保存するカテゴリ', true) as CategoryChannel | TextChannel;

        const logChannel = (args.getChannel('保存先') ?? await interaction.guild?.channels.create({
            name: `ログ ${targetCategory.name}`,
            type: ChannelType.GuildText,
            permissionOverwrites: targetCategory.permissionOverwrites.cache
        })) as TextChannel

        const children = (() => {
            if (targetCategory instanceof CategoryChannel) {
                return discordSort(targetCategory.children.cache.filter((ch): ch is TextChannel => ch.type === ChannelType.GuildText))
            }
            return new Collection<string, TextChannel>([[targetCategory.id, targetCategory]])
        })();

        if (children.size == 0) {
            return reply(interaction, { content: '保存するチャンネルがありません', ephemeral: true })
        }

        const descriptions = await Promise.all(children.map(async child => {

            let description = ''

            description += await RunArchive(child, logChannel)

            const threads = (await child.threads.fetchActive()).threads.concat((await child.threads.fetchArchived()).threads)
            if (threads.size > 0) {
                description += '\n' + (await Promise.all(threads.map(async thread => await RunArchive(thread, logChannel)))).join('\n')
            }
            return description
        }))

        await logChannel.send({
            embeds: [new EmbedBuilder()
                .setTitle(targetCategory.name)
                .setColor([47, 49, 54])
                .setDescription(descriptions.join('\n'))
            ]
        })

        await reply(interaction, `「${targetCategory.name}」の保存が完了しました`)
    }
})

const RunArchive = async (source: GuildTextBasedChannel, destination: TextChannel): Promise<string> => {
    const messages = [...(await fetchAllMessages(source)).reverse().values()]
    const slicedMessages: Message[][] = [];
    const accentColor = new Collection<string, number>()
    const destinationThread = await destination.threads.create({ name: source.name })

    const embedSize = ((message: Message) => message.content.length + (message.member?.nickname || message.author.username).length + 16)
    let tail = 0;
    let length = 0;
    messages.map((message, index) => {
        if (index - tail == 9 || message.attachments.size > 0 || length + embedSize(message) > 4000) {
            slicedMessages.push(messages.slice(tail, index + 1));
            tail = index + 1;
            length = 0;
        }
        length += embedSize(message)
    })

    if (tail < messages.length) {
        slicedMessages.push(messages.slice(tail));
    }

    for await (const messages of slicedMessages) {

        await destinationThread.sendTyping()

        const embeds = messages.filter(message => message.content != '').map(message => {
            const date = new Date(message.createdAt)
            const timeStamp = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`

            return new EmbedBuilder()
                .setAuthor({
                    name: message.member?.nickname || message.author.username,
                    iconURL: message.author.avatarURL() ?? undefined
                })
                .setColor([47, 49, 54])
                .setDescription(message.content)
                .setFooter({ text: timeStamp })
        })

        if (embeds.length > 0) {
            await destinationThread.send({ embeds: embeds });
        }


        const attachments = messages.slice(-1)[0].attachments

        if (!attachments.size) continue

        const files = (await Promise.all(attachments.map(async attachment => {
            if (attachment.contentType?.startsWith('image/')) {
                await destinationThread.sendTyping()
                await destinationThread.send(attachment.url)
            } else {
                return new EmbedBuilder()
                    .setColor([47, 49, 54])
                    .setDescription(`[${attachment.name}](${attachment.url})`)
            }
        }))).filter((file): file is EmbedBuilder => file != undefined)

        if (files.length > 0) {
            await destinationThread.send({ embeds: files })
        }
    }
    (await destinationThread.fetchStarterMessage())?.delete()
    await destinationThread.setArchived(true)

    return (source.isThread() ? '┗' : '') + `[# ${destinationThread.name}](${destinationThread.url})`
}