import { ButtonBuilder, ButtonStyle, Collection, Colors, EmbedBuilder, GuildMember, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";
import unehemeralButton from "../../components/buttons/unehemeral";
import revoteButton from "./revote";
import { buttonToRow } from "../../utils/ButtonToRow";
import { rename } from "../../commands/slashcommands/rename";
import runoffVoteButton from "./runoffVote";
import { splitMessage } from "../../utils/SplitMessage";

export default new Button({
    customId: "agregatePoll",
    build: ({ pollId }: { pollId: string }) => [
        new ButtonBuilder().setCustomId(`agregatePoll:${pollId}`).setLabel("集計").setStyle(ButtonStyle.Danger),
    ],
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });
        const pollId = args[0];
        const poll = await PollModel.findById(pollId);
        if (!poll) return;

        if (interaction.user.id !== poll.ownerId) {
            await reply(interaction, { content: "集計は投票を開始した人のみが行えます", ephemeral: true });
            return;
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
            let content = "";

            const renameMap = new Map<GuildMember, string>();
            const roleMap = new Map<GuildMember, Role>();

            for (const [userId, choiceIndex] of votes.entries()) {
                const choice = poll.choices[choiceIndex];
                const { roleId } = choice;
                const role = roleId ? guild.roles.cache.get(roleId) : undefined;
                const member = guild.members.cache.get(userId);
                const roleName = role ? role.name : choice.label;
                if (result.get(choiceIndex)?.length === 1) {
                    if (member) {
                        renameMap.set(member, roleName);
                        if (role && !member.roles.cache.has(role.id)) {
                            roleMap.set(member, role);
                        }
                    }
                    content += `<@${userId}> → ${role || roleName} ✅\n`;
                } else {
                    warn = true;
                    content += `<@${userId}> → ${role || roleName} ⚠️\n`;
                }
            }

            const descrption = `### 集計結果\n${content || "なし"}`;

            if (interaction.channel?.isSendable()) {
                await interaction.channel.send({
                    embeds: splitMessage(descrption).map(text =>
                        new EmbedBuilder().setDescription(text).setColor(warn ? Colors.Yellow : Colors.Green)
                    ),
                    allowedMentions: { parse: [] },
                    components: warn ? buttonToRow(revoteButton.build({ pollId })) : [],
                });
            }

            await reply(interaction, { content: "集計結果を表示しました", ephemeral: true });

            for await (const [member, roleName] of renameMap.entries()) {
                await rename(member, roleName).catch(() => { });
            }

            for await (const [member, role] of roleMap.entries()) {
                try {
                    await member.roles.add(role);
                    await reply(interaction, { content: `${member}に${role}を付与しました` });
                } catch (e) {
                    await reply(interaction, {
                        content: `${member}に${role}を付与できませんでした\nマダミナリンクより上位のロールは付与できません`,
                    });
                }
            }
        } else if (poll.type === "vote") {
            result.sort((a, b) => b.length - a.length);

            const numOfVotes = result
                .map((voters, choiceIndex) => {
                    const choice = poll.choices[choiceIndex];
                    return `${choice.label} : ${voters.length}票`;
                })
                .join("\n");

            const votings = [...votes.entries()]
                .map(([userId, choiceIndex]) => {
                    const choice = poll.choices[choiceIndex];
                    return `<@${userId}> → ${choice.label}`;
                })
                .join("\n");
            const topVoteGetters = result.filter(voters => voters.length === result.first()?.length);

            const descrption = `### 投票数\n${numOfVotes || "なし"}\n### 投票先\n${votings || "なし"}`;
            await reply(interaction, {
                embeds: splitMessage(descrption).map(text =>
                    new EmbedBuilder().setDescription(text).setColor(Colors.Blue)
                ),
                allowedMentions: { parse: [] },
                components: buttonToRow([
                    ...unehemeralButton.build(),
                    ...(topVoteGetters.size >= 2 ? runoffVoteButton.build({ pollId }) : []),
                ]),
            });
        }
        await interaction.message.delete();
    },
});
