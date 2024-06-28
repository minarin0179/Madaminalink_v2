import { ButtonBuilder, ButtonStyle, Collection } from "discord.js";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";
import { sendPoll } from "../../commands/slashcommands/poll";

export default new Button({
    customId: "runoff",
    build: ({ pollId }: { pollId: string }) => [
        new ButtonBuilder().setCustomId(`runoff:${pollId}`).setLabel("決選投票").setStyle(ButtonStyle.Danger),
    ],
    execute: async ({ interaction, args }) => {
        const pollId = args[0];
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        const votes = poll.voters; // Map<userID, choiceIndex> 誰が何に入れたか
        const result = new Collection<number, string[]>(); // Map<choiceIndex, [userID]> 何に誰が入れたか
        votes.forEach((choiceIndex: number, userId: string) => {
            if (!result.has(choiceIndex)) result.set(choiceIndex, []);
            result.get(choiceIndex)?.push(userId);
        });

        const topVoteGetters = result.filter(voters => voters.length === result.first()?.length);
        const restChoices = poll.choices.filter((_, index: number) => topVoteGetters.has(index));

        const pollOptions = {
            type: poll.type,
            ownerId: poll.ownerId,
            choices: restChoices,
            voters: new Map(),
        };

        await sendPoll(interaction, pollOptions);

        await reply(interaction, { content: "決戦投票を開始しました", ephemeral: true });
    },
});
