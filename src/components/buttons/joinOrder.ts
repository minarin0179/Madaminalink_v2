import { APIEmbed, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Button } from "../../structures/Button";
import { NO_USER_MESSAGE } from "../../commands/slashcommands/order";

export default new Button({
    customId: "joinOrder",
    build: () => [new ButtonBuilder().setCustomId(`joinOrder`).setLabel(`参加`).setStyle(ButtonStyle.Primary)],
    execute: async ({ interaction }) => {
        const embed = interaction.message.embeds[0] as APIEmbed;

        const { description } = embed;

        if (!description) return;

        const members = new Set(description.split("\n"));
        members.delete(NO_USER_MESSAGE);
        members.add(interaction.user.toString());
        const newEmbed = new EmbedBuilder(embed).setDescription(Array.from(members).join("\n"));

        await interaction.update({ embeds: [newEmbed] });
    },
});
