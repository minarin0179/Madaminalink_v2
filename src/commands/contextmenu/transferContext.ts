import { ApplicationCommandType, CategoryChannel, ChannelType, ContextMenuCommandBuilder, discordSort, GuildTextBasedChannel, NewsChannel, TextChannel } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import transferListImmed from "../../components/selectmenu/transferListImmed";
import { reply } from "../../utils/Reply";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName('メッセージを転送')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isMessageContextMenuCommand()) return

        const channel = interaction.channel as GuildTextBasedChannel
        const category = channel?.parent?.parent ?? channel?.parent as CategoryChannel
        const channels = category?.children.cache ?? interaction.guild?.channels.cache
            .filter((channel): channel is TextChannel | NewsChannel =>
                !channel.parent && (channel.type == ChannelType.GuildText || channel.type == ChannelType.GuildNews))

        if (!channels) return

        await reply(interaction, {
            content: '転送先のチャンネルを選択してください',
            components: transferListImmed.build([...discordSort(channels).values()], interaction.targetMessage)
        })
    }
})