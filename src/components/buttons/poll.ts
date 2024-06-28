import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";
import { LimitLength } from "../../utils/LimitLength";
import { Choice, PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "poll",
    build: ({ pollId, choices }: { pollId: string, choices: Choice[]; }) =>
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

        poll.voters.set(interaction.user.id, choiceId);

        isVoted
            ? await reply(interaction, `${poll.choices[choiceId].label}に変更しました`)
            : await reply(interaction, `${poll.choices[choiceId].label}を選択しました`);

        await poll.save();
    },
});
