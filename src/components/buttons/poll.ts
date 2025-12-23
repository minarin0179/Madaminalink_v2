import { ButtonBuilder, ButtonStyle } from "discord.js";
import { MyConstants } from "../../constants/constants";
import { Button } from "../../structures/Button";
import { type Choice, PollModel } from "../../structures/Poll";
import { LimitLength } from "../../utils/LimitLength";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "poll",
    build: ({ pollId, choices }: { pollId: string; choices: Choice[] }) =>
        choices.map((choice, index) => {
            const label = LimitLength(choice.label, 16);

            return new ButtonBuilder()
                .setCustomId(`poll:${pollId},${index}`)
                .setLabel(label)
                .setStyle(ButtonStyle.Primary);
        }),
    execute: async ({ interaction, args }) => {
        const pollId = args[0];
        const choiceId = parseInt(args[1]);
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        const isVoted = poll.voters.has(interaction.user.id);

        if (!isVoted) {
            if (
                poll.type === "char" &&
                poll.voters.size >= MyConstants.maxCharVoters
            ) {
                return reply(interaction, {
                    content: `投票へ参加できる人数が上限に達しています(キャラ選択に参加できるのは最大で${MyConstants.maxCharVoters}人です)`,
                    ephemeral: false,
                });
            } else if (
                poll.type === "vote" &&
                poll.voters.size >= MyConstants.maxVoteVoters
            ) {
                return reply(interaction, {
                    content: `投票へ参加できる人数が上限に達しています(犯人投票に参加できるのは最大で${MyConstants.maxVoteVoters}人です)`,
                    ephemeral: false,
                });
            }
        }

        poll.voters.set(interaction.user.id, choiceId);

        isVoted
            ? await reply(
                  interaction,
                  `${poll.choices[choiceId].label}に変更しました`
              )
            : await reply(
                  interaction,
                  `${poll.choices[choiceId].label}を選択しました`
              );

        await poll.save();
    },
});
