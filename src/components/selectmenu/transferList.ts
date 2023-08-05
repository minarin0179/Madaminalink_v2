import { ActionRowBuilder, GuildTextBasedChannel, StringSelectMenuBuilder } from "discord.js";
import { SelectMenu } from "../../structures/SelectMenu";
import { arraySplit } from "../../utils/ArraySplit";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";
import transferButton from "../buttons/transfer";
import { buildTransferMessage } from "../../commands/slashcommands/transfer";

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
            if (!destination) continue;
            await reply(interaction, `「${destination}」に転送するメッセージと同じリアクションを付けてください`);

            await interaction.channel?.send(buildTransferMessage(destination));
        }
    },
});
