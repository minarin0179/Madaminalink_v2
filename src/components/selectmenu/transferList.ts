import {
    ActionRowBuilder,
    type GuildTextBasedChannel,
    StringSelectMenuBuilder,
} from "discord.js";
import { sendTransferMessage } from "../../commands/slashcommands/transfer";
import { SelectMenu } from "../../structures/SelectMenu";
import { arraySplit } from "../../utils/ArraySplit";

export default new SelectMenu({
    customId: "transferList",
    build: (channels: GuildTextBasedChannel[]) =>
        arraySplit(channels, 25).map((channels, index) =>
            new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId(`transferList:${index}`)
                    .setPlaceholder(`転送先を選択 (ページ${index + 1})`)
                    .setMinValues(1)
                    .setMaxValues(channels.length)
                    .addOptions(
                        channels.map(channel => ({
                            label: channel.name,
                            value: channel.id,
                        }))
                    )
            )
        ),
    execute: async ({ interaction }) => {
        for await (const id of interaction.values) {
            const destination = interaction.guild?.channels.cache.get(id);
            if (!destination?.isTextBased()) continue;
            await sendTransferMessage(interaction, destination);
        }
    },
});
