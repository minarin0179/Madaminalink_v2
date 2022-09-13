import { ChannelType, GuildChannel, SlashCommandBuilder, TextChannel } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { arraySplit } from "../../utils/ArraySplit";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { isCategory } from "../../utils/isCategory";
import { reply } from "../../utils/Reply";


export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('cleanup')
        .setDescription('メッセージをすべて削除します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('対象')
            .setDescription('指定しなかった場合はコマンドが送信されたチャンネル')
            .setRequired(false)
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await reply(interaction, '削除中...')

        const targetChannel = (args.getChannel('対象') ?? interaction.channel) as GuildChannel
        if (!targetChannel) return

        if (targetChannel.type == ChannelType.GuildText) {
            await deleteAllMessages(targetChannel as TextChannel)
        } else if (isCategory(targetChannel)) {
            const channels = targetChannel.children.cache
                .filter((channel): channel is TextChannel => channel.type == ChannelType.GuildText)
            await Promise.all(channels.map(async channel => {
                await deleteAllMessages(channel)
            }))
        }

        await reply(interaction, '削除が完了しました')
    }
})

const deleteAllMessages = async (channel: TextChannel) => {
    const allMessages = await fetchAllMessages(channel)

    const [messages, oldMessages] = allMessages.partition(message => (Date.now() - message.createdTimestamp) < 1_209_600_000);

    await Promise.all(arraySplit(Array.from(messages.values()), 100).map(async messagesSliced => {
        await channel.bulkDelete(messagesSliced)
    }))

    //２週間以上前のメッセージを順番に削除(遅い)
    await Promise.all(oldMessages.map(async message => {
        await message.delete();
    }));
}