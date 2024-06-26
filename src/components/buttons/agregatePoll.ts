import { ButtonBuilder, ButtonStyle, Collection, EmbedBuilder, GuildMember, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { PollModel } from "../../structures/Poll";
import { reply } from "../../utils/Reply";
import unehemeralButton from "../../components/buttons/unehemeral";
import revoteButton from "./revote";
import { buttonToRow } from "../../utils/ButtonToRow";
import { rename } from "../../commands/slashcommands/rename";
import runoffVoteButton from "./runoffVote";

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

            await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .addFields({ name: "集計結果", value: content || "なし" })
                        .setColor(warn ? 0xffcc4d : 0x77b255),
                ],
                allowedMentions: { parse: [] },
                components: warn ? buttonToRow(revoteButton.build({ pollId })) : [],
            });

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

            await reply(interaction, {
                embeds: [
                    new EmbedBuilder()
                        .addFields(
                            { name: "投票数", value: numOfVotes || "なし" },
                            { name: "投票先", value: votings || "なし" }
                        )
                        .setColor(0x3b88c3),
                ],
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
