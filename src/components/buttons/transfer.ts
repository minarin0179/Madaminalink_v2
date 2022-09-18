import { ButtonBuilder, ButtonStyle, TextChannel, ChannelType, GuildTextBasedChannel } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";
import { transferMessage } from "../../utils/transferMessage";

export default new Button({
    customId: 'transfer',
    build: ({ destination }: { destination: GuildTextBasedChannel }) => [new ButtonBuilder()
        .setCustomId(`transfer:${destination.id}`)
        .setLabel(`「#${destination.name}」へ転送`)
        .setStyle(ButtonStyle.Primary)]
    ,
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true })

        const destinations = args.map(id => interaction.guild?.channels.cache.get(id))
            .filter((channel): channel is TextChannel => channel?.type === ChannelType.GuildText)

        interaction.channel?.messages.cache.clear()
        const reactions = (await interaction.message.fetch()).reactions.cache

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

        await reply(interaction, '転送が完了しました')
    },
})