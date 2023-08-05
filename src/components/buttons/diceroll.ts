import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: "diceroll",
    build: ({ x, y }: { x: number; y: number }) => [
        new ButtonBuilder().setCustomId(`diceroll:${x},${y}`).setLabel(`${x}d${y}`).setStyle(ButtonStyle.Primary),
    ],
    execute: async ({ interaction, args }) => {
        const [x, y] = args.map(Number);
        await interaction.reply("ダイスロールを実行中...");
        await interaction.channel?.send(`${interaction.member} 🎲 ${diceRole(x, y)}`);
        await interaction.deleteReply();
    },
});

const diceRole = (x: number, y: number): string => {
    if (x == 1) {
        return `${x}d${y} → ${getRandomInt(y)}`;
    }
    const result = [...Array(x)].map(() => getRandomInt(y));
    return `${x}d${y} → [${result.join(",")}] → ${result.reduce((a, b) => a + b)}`;
};

const getRandomInt = (max: number) => Math.floor(Math.random() * max) + 1;
