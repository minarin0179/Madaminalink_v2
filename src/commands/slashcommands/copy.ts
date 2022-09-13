import { ChannelType, GuildChannel, SlashCommandBuilder, CategoryChannel } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { isCategory } from "../../utils/isCategory";
import { reply } from "../../utils/Reply";
import { transferAllMessages } from "../../utils/transferMessage";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('copy')
        .setDescription('チャンネルを複製します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('対象')
            .setDescription('コピーするチャンネル/カテゴリー')
            .addChannelTypes(ChannelType.GuildCategory, ChannelType.GuildText)
            .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await reply(interaction, 'コピー中...')

        const originalChannel = (args.getChannel('対象') ?? interaction.channel) as GuildChannel
        await copyChannel(originalChannel)

        await reply(interaction, 'コピーが完了しました')
    }
})

const copyChannel = async (originalChannel: GuildChannel, option?: any): Promise<any> => {
    if (originalChannel.isVoiceBased()) {
        return await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
            bitrate: originalChannel.bitrate,
            userLimit: originalChannel.userLimit,
            ...option
        })
    } else if (originalChannel.isTextBased()) {
        const newChannel = await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
            // @ts-ignore voicebasedでVoiceChannelを弾いているためtopicプロパティは存在する
            topic: originalChannel.topic || '',
            nsfw: originalChannel.nsfw,
            rateLimitPerUser: originalChannel.rateLimitPerUser || 0,
            ...option
        })
        await transferAllMessages(originalChannel, newChannel).catch(e => { throw e })
        return newChannel
    }
    else if (isCategory(originalChannel)) {
        const newCategory = await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
        }) as CategoryChannel

        return await Promise.all(originalChannel.children.cache.map(async c =>
            copyChannel(c, { name: c.name, parent: newCategory })))
    }
}

