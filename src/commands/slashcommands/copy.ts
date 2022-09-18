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
        const newChannels = await copyChannel(originalChannel)

        if (newChannels.length === 1) {
            const [from, to] = newChannels[0]
            if (from.isTextBased() && to.isTextBased()) {
                await transferAllMessages(from, to)
            }
        } else {
            const updates = Object.fromEntries(newChannels.map(([from, to]) => [from.id, to]))
            newChannels.map(async newChannel => {
                const [from, to] = newChannel
                if (from.isTextBased() && to.isTextBased()) {
                    await transferAllMessages(from, to, updates)
                }
            })
        }


        await reply(interaction, 'コピーが完了しました')
    }
})

/**
 * originalChannel:GuildChannel -> [[originalChannel,newChannel]]
 * originalChannel:CategoryChannel -> [...[originalChannel,newChannel]]
 */

const copyChannel = async (originalChannel: GuildChannel, option?: any): Promise<GuildChannel[][]> => {
    if (originalChannel.isVoiceBased()) {
        return [[originalChannel, await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
            ...option
        })]]
    } else if (originalChannel.isTextBased()) {
        return [[originalChannel, await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
            // @ts-ignore voicebasedでVoiceChannelを弾いているためtopicプロパティは存在する
            topic: originalChannel.topic || '',
            nsfw: originalChannel.nsfw,
            rateLimitPerUser: originalChannel.rateLimitPerUser || 0,
            ...option
        })]]
    }
    else if (isCategory(originalChannel)) {
        const newCategory = await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
        }) as CategoryChannel

        return await Promise.all(originalChannel.children.cache.map(async c =>
            (await copyChannel(c, { name: c.name, parent: newCategory }))[0]
        ))
    }
    return []
}

