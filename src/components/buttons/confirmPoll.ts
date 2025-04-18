import { ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";
import { MyConstants } from "../../constants/constants";

export default new Button({
    customId: "confirmPoll",
    build: ({ pollId }: { pollId: string }) => [
        new ButtonBuilder().setCustomId(`confirmPoll:${pollId}`).setLabel("確認").setStyle(ButtonStyle.Secondary),
    ],
    execute: async ({ interaction, args }) => {
        const pollId = args[0];
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        if (interaction.user.id !== poll.ownerId) {
            await reply(interaction, { content: "投票状況の確認は投票を開始した人のみが行えます", ephemeral: true });
            return;
        }

        const votes = poll.voters; // Map<userID, choiceIndex> 誰が何に入れたか

        const content = [...votes.entries()]
            .map(([userId, choiceIndex]) => {
                const choice = poll.choices[choiceIndex];
                return `<@${userId}> → ||${choice.label}|| `;
            })
            .join("\n");

        await reply(interaction, {
            embeds: [
                new EmbedBuilder()
                    .addFields({ name: "投票数", value: poll.voters.size.toString() })
                    .addFields({ name: "投票状況", value: content || "まだ投票がありません" })
                    .setColor(MyConstants.color.embed_background),
            ],
        });
    },
});
