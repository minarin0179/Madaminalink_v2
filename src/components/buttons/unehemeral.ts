import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
  customId: "unehemeral",
  build: () => [
    new ButtonBuilder()
      .setCustomId(`unehemeral`)
      .setLabel("公開")
      .setStyle(ButtonStyle.Primary),
  ],
  execute: async ({ interaction }) => {
    const { content, embeds } = interaction.message;
    await interaction.update({ content, embeds, components: [] });
    if (interaction.channel?.isSendable()) {
      await interaction.channel.send({ content, embeds });
    }
  },
});
