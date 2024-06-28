import { APIEmbed, ButtonBuilder, ButtonStyle, Embed } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: "joinOrder",
    build: () => [new ButtonBuilder().setCustomId(`joinOrder`).setLabel(`参加`).setStyle(ButtonStyle.Primary)],
    execute: async ({ interaction, args }) => {

        const embed = interaction.message.embeds[0];

        const {description} = embed;

        const members = new Set(description.split("\n"));
        members.add(interaction.user.toString());
        const newEmbed: APIEmbed = {
            ...embed,
            description: `${Array.from(members).join("\n")}`,
        };

        await interaction.update({ embeds: [newEmbed] });
    },
});
