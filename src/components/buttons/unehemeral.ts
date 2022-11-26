import { ButtonBuilder, ButtonStyle, Guild, GuildChannel, Role, User } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: 'unehemeral',
    build: () => [new ButtonBuilder()
        .setCustomId(`unehemeral`)
        .setLabel("公開")
        .setStyle(ButtonStyle.Primary)
    ],
    execute: async ({ interaction }) => {
        const { content, embeds, components } = interaction.message
        console.log(components[0].toJSON())
        await interaction.update({ content, embeds, components: [] })
        await interaction.channel?.send({ content, embeds })
    },
})