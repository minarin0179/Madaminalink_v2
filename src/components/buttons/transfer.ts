import { ButtonBuilder, ButtonStyle, TextChannel, ChannelType } from "discord.js";
import { Button } from "../../structures/Button";
import { transferMessage } from "../../utils/transferMessage";

export default new Button({
    customId: 'transfer',
    build: ({ destination }) => {
        return new ButtonBuilder()
            .setCustomId(`transfer:${destination.id}`)
            .setLabel(`「#${destination.name}」へ転送`)
            .setStyle(ButtonStyle.Primary)
    },
    execute: async ({ interaction, args }) => {
        await interaction.reply({ content: '転送中...', ephemeral: true })

        const destinations = args.map(id => interaction.guild?.channels.cache.get(id))
            .filter((channel): channel is TextChannel => channel?.type === ChannelType.GuildText)

        interaction.message.reactions.cache.clear()

        const reactions = (await interaction.message.fetch()).reactions.cache

        //interaction.channel?.messages.cache.clear()

        const messages = (await interaction.channel?.messages.fetch({ limit: 100 }))?.reverse()
        messages?.delete(interaction.message.id)//転送用メッセージ自身は除く

        if (!messages) return
        for await (const message of messages.values()) {
            const keys = message.reactions.cache.keys()
            if (reactions.hasAny(...keys)) {
                await Promise.all(destinations.map(destination => {
                    transferMessage(message, destination, true)
                }))
            }
        }

        await interaction.followUp({ content: '転送が完了しました', ephemeral: true })
    },
})