import {
    type APIEmbed,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type GuildMember,
} from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "shuffleOrder",
    build: ({ author }: { author: GuildMember }) => [
        new ButtonBuilder()
            .setCustomId(`shuffleOrder:${author.id}`)
            .setLabel(`並べ替え`)
            .setStyle(ButtonStyle.Success),
    ],
    execute: async ({ interaction, args }) => {
        const embed = interaction.message.embeds[0] as APIEmbed;

        const { description } = embed;

        if (!description) return;

        const [authorId] = args;
        if (authorId !== interaction.user.id) {
            await reply(
                interaction,
                "並べ替えはコマンドの実行者のみが行えます"
            );
            return;
        }

        const members = description.split("\n");
        const shuffledMembers = shuffleArray(members);
        const newEmbed = new EmbedBuilder(embed)
            .setTitle("並び替え結果")
            .setDescription(
                Array.from(shuffledMembers)
                    .map((m, i) => `${i}. ${m}`)
                    .join("\n")
            );

        await reply(interaction, {
            embeds: [newEmbed],
            ephemeral: false,
        });
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
