import { APIEmbed, ButtonBuilder, ButtonStyle, Embed } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: "shuffleOrder",
    build: () => [new ButtonBuilder().setCustomId(`shuffleOrder`).setLabel(`並べ替え`).setStyle(ButtonStyle.Secondary)],
    execute: async ({ interaction, args }) => {

        const embed = interaction.message.embeds[0];

        const { description } = embed;

        if (!description) return;

        const members = description.split("\n");
        const shuffledMembers = shuffleArray(members);
        const newEmbed: APIEmbed = {
            ...embed,
            description: `${shuffledMembers.join("\n")}`,
        };

        await interaction.update({ embeds: [newEmbed] });
    },
});


const shuffleArray = <T>(array: T[]): T[] => {
    const newArray = [...array]; // 元の配列をコピーして新しい配列を作成
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // 要素を入れ替える
    }
    return newArray;
};
