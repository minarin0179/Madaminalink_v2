import { ActionRowBuilder, SelectMenuBuilder, GuildChannel, Message } from "discord.js";
import { SelectMenu } from "../../structures/SelectMenu";
import { arraySplit } from "../../utils/ArraySplit";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";
import { transferMessage } from "../../utils/transferMessage";
import transferButton from "../buttons/transfer";

export default new SelectMenu({
    customId: 'transferListImmed',
    build: (channels: GuildChannel[], message: Message) => arraySplit(channels, 25).map((channels, index) =>
        new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(new SelectMenuBuilder()
                .setCustomId(`transferListImmed:${message.id}`)
                .setPlaceholder(`転送先を選択 (ページ${index + 1})`)
                .setMinValues(1)
                .setMaxValues(channels.length)
                .addOptions(
                    channels.map(channel => ({
                        label: channel.name,
                        value: channel.id
                    }))
                )
            )
    ),
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true })

        const message = await interaction.channel?.messages.fetch(args[0])

        if (!message) return

        for await (const id of interaction.values) {
            const destination = interaction.guild?.channels.cache.get(id)
            if (!destination?.isTextBased()) continue
            transferMessage(message, destination)
        }

        await reply(interaction, '転送が完了しました')
    },
})