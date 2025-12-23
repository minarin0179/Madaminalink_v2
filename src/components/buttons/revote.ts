import { ButtonBuilder, ButtonStyle, Collection } from "discord.js";
import { sendPoll } from "../../commands/slashcommands/poll";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "revote",
    build: ({ pollId }: { pollId: string }) => [
        new ButtonBuilder()
            .setCustomId(`revote:${pollId}`)
            .setLabel("再投票")
            .setStyle(ButtonStyle.Danger),
    ],
    execute: async ({ interaction, args }) => {
        const pollId = args[0];
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        if (interaction.user.id !== poll.ownerId) {
            await reply(interaction, {
                content: "再投票は投票を開始した人のみが行えます",
                ephemeral: true,
            });
            return;
        }

        const votes = poll.voters; // Map<userID, choiceIndex> 誰が何に入れたか
        const result = new Collection<number, string[]>(); // Map<choiceIndex, [userID]> 何に誰が入れたか
        votes.forEach((choiceIndex: number, userId: string) => {
            if (!result.has(choiceIndex)) result.set(choiceIndex, []);
            result.get(choiceIndex)?.push(userId);
        });

        // 投票数がでない選択しのみを取り出す
        const restChoices = poll.choices.filter(
            (_, index: number) => result.get(index)?.length !== 1
        );

        const pollOptions = {
            type: poll.type,
            ownerId: poll.ownerId,
            choices: restChoices,
            voters: new Map(),
        };

        await sendPoll(interaction, pollOptions);

        await reply(interaction, {
            content: "再投票を開始しました",
            ephemeral: true,
        });
    },
});
