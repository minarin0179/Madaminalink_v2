import { ActionRowBuilder, SelectMenuBuilder, GuildChannel } from "discord.js";
import { SelectMenu } from "../../structures/SelectMenu";
import { arraySplit } from "../../utils/ArraySplit";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";
import transferButton from "../buttons/transfer";

export default new SelectMenu({
    customId: 'transferList',
    build: (channels: GuildChannel[]) => arraySplit(channels, 25).map((channels, index) =>
        new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(new SelectMenuBuilder()
                .setCustomId(`transferList`)
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
    execute: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true })

        for await (const id of interaction.values) {
            const destination = interaction.guild?.channels.cache.get(id)
            if (!destination) continue
            await interaction.channel?.send({
                components: buttonToRow(transferButton.build({ destination }))
            })
        }

        await reply(interaction, 'ボタンを作成しました')
    },
})