import { ButtonBuilder, ButtonStyle, Collection, EmbedBuilder, Guild, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";
import unehemeralButton from "../../components/buttons/unehemeral";
import revoteButton from "../../components/buttons/revote";
import { buttonToRow } from "../../utils/ButtonToRow";

export default new Button({
    customId: "agregatePoll",
    build: ({ pollId }: { pollId: string }) => [
        new ButtonBuilder()
            .setCustomId(`agregatePoll:${pollId}`)
            .setLabel("集計")
            .setStyle(ButtonStyle.Primary)
    ],
    execute: async ({ interaction, args }) => {
        const pollId = args[0];
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        if (interaction.user.id !== poll.ownerId) {
            await reply(interaction, { content: "集計は投票を開始した人のみが行えます", ephemeral: true });
            return
        }

        const votes = poll.voters; // Map<userID, choiceIndex> 誰が何に入れたか
        const result = new Collection<number, string[]>(); // Map<choiceIndex, [userID]> 何に誰が入れたか
        votes.forEach((choiceIndex, userId) => {
            if (!result.has(choiceIndex)) result.set(choiceIndex, []);
            result.get(choiceIndex)?.push(userId);
        });
        const guild = interaction.guild!;

        if (poll.type === "char") {
            let warn = false;
            const content = [...votes.entries()].map(([userId, choiceIndex]) => {
                const choice = poll.choices[choiceIndex];
                if (result.get(choiceIndex)?.length === 1) {
                    const roleId = poll.choices[choiceIndex].roleId
                    const role = roleId ? guild.roles.cache.get(roleId) : null;
                    const member = guild.members.cache.get(userId);
                    if (role && member) member.roles.add(role);
                    return `<@${userId}> → ${role ? role : choice.label} ✅`;
                } else {
                    warn = true;
                    return `<@${userId}> → ${choice.label} ⚠️`;
                }
            }).join("\n");

            await interaction.channel?.send({
                embeds: [new EmbedBuilder()
                    .addFields({ name: "集計結果", value: content || "なし" })
                    .setColor(warn ? 0xffcc4d : 0x77b255)],
                allowedMentions: { parse: [] },
                components: warn ? buttonToRow(revoteButton.build({ pollId })) : []
            });
        }

        else if (poll.type === "vote") {

            result.sort((a, b) => b.length - a.length);

            const numOfVotes = result.map((voters, choiceIndex) => {
                const choice = poll.choices[choiceIndex];
                return `${choice.label} : ${voters.length}票`;
            }).join("\n");

            const votings = [...votes.entries()].map(([userId, choiceIndex]) => {
                const choice = poll.choices[choiceIndex];
                return `<@${userId}> → ${choice.label}`;
            }).join("\n");


            await reply(interaction, {
                embeds: [
                    new EmbedBuilder()
                        .addFields(
                            { name: "投票数", value: numOfVotes || "なし" },
                            { name: "投票先", value: votings || "なし" }
                        )
                        .setColor(0x3b88c3)
                ],
                allowedMentions: { parse: [] },
                components: buttonToRow(unehemeralButton.build()),
            });
        }

        await reply(interaction, "集計が完了しました");

    },
});
