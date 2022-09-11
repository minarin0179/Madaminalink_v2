import { CategoryChannel, ChannelType, Collection, discordSort, EmbedBuilder, Message, MessageType, SlashCommandBuilder, TextBasedChannel, TextChannel, ThreadChannel, TimestampStyles } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { fetchAllMessages } from "../../utils/FetchAllMessages";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('archive')
        .setDescription('チャンネルをスレッドとして保存します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('保存するカテゴリ')
            .addChannelTypes(ChannelType.GuildCategory)
            .setDescription('保存するカテゴリ')
            .setRequired(true)
        ).addChannelOption(option => option
            .addChannelTypes(ChannelType.GuildText)
            .setName('保存先')
            .setDescription('保存先のチャンネル')
            .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.reply({
            content: '保存を開始します',
            ephemeral: true
        })

        const targetCategory = args.getChannel('保存するカテゴリ') as CategoryChannel

        const logChannel = (args.getChannel('保存先') ?? await interaction.guild?.channels.create({
            name: `ログ ${targetCategory.name}`,
            type: ChannelType.GuildText,
            permissionOverwrites: targetCategory.permissionOverwrites.cache
        })) as TextChannel


        const children = discordSort(targetCategory.children.cache
            .filter((ch): ch is TextChannel => ch.type === ChannelType.GuildText))

        const descriptions = await Promise.all(children.map(async child => {

            let description = ''
            const logThread = await logChannel.threads.create({
                name: child.name,
                autoArchiveDuration: 60,
            })
            description += `[# ${child.name}](${logThread.url})\n`

            const threads = (await child.threads.fetch()).threads
            await Promise.all(threads.map(async thread => {
                const logThread = await logChannel.threads.create({
                    name: thread.name,
                    autoArchiveDuration: 60,
                })
                description += `┗[# ${thread.name}](${logThread.url})\n`
                await RunArchive(thread, logThread)
            }))

            await RunArchive(child, logThread)

            return description
        }))

        //システムメッセージを削除
        logChannel.bulkDelete((await logChannel.messages.fetch({ limit: 100 })).filter(message => message.type == MessageType.ThreadCreated))

        await logChannel.send({
            embeds: [new EmbedBuilder()
                .setTitle(targetCategory.name)
                .setColor([47, 49, 54])
                .setDescription(descriptions.join(''))
            ]
        })

        await interaction.followUp({ content: 'ログの保存が完了しました', ephemeral: true });
    }
})

const RunArchive = async (source: TextBasedChannel, destination: ThreadChannel) => {
    const messages = [...(await fetchAllMessages(source)).reverse().values()]
    const slicedMessages: Message[][] = [];
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
        const date = new Date(messages[0].createdAt)
        const timeStamp = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
        await destination.sendTyping()


        const embeds = messages.filter(message => message.content != '').map(message => {
            return new EmbedBuilder()
                .setAuthor({
                    name: message.member?.nickname || message.author.username,
                    iconURL: message.author.avatarURL() ?? undefined
                })
                .setColor([47, 49, 54])
                .setDescription(message.content)
                .setFooter({ text: timeStamp })
        });
        if (embeds.length > 0) {
            await destination.send({ embeds: embeds });
        }


        const files = messages.slice(-1)[0].attachments.filter(attachment => attachment.size < 8388608).map(attachment => attachment.url);
        if (files.length > 0) {
            await destination.send({ files: files });
        }
    }

    await destination.setArchived(true)
}