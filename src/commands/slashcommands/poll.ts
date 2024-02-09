import {
    BaseInteraction,
    ButtonInteraction,
    ChatInputCommandInteraction,
    Collection,
    CommandInteraction,
    ComponentType,
    EmbedBuilder,
    GuildMember,
    Role,
    SlashCommandBuilder,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import pollButton from "../../components/buttons/poll";
import { buttonToRow } from "../../utils/ButtonToRow";
import agregatePollButton from "../../components/buttons/agregatePoll";
import unehemeralButton from "../../components/buttons/unehemeral";
import { rename } from "./rename";
import { Choice, PollModel, PollOptions } from "../../structures/Poll";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("poll")
        .setDescription("キャラ選択/犯人投票を行います")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option
                .setName("投票モード")
                .setDescription("集計結果をPLに非表示にし、得票数を表示します")
                .setRequired(true)
                .addChoices({ name: "キャラ選択", value: "char" }, { name: "犯人投票", value: "vote" })
        )
        .addStringOption(option =>
            option.setName("選択肢").setDescription("選択肢をスペース区切りで入力して下さい").setRequired(true)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        const voteType = args.getString("投票モード", true);
        const choices = args
            .getString("選択肢", true)
            .split(/[ 　,、]/)
            .filter(choice => choice !== "")
            .map(choice => {
                const roleId = choice.match(/<@&(.*)>/);
                const role = roleId ? interaction.guild?.roles.cache.get(roleId[1]) : null;
                return {
                    label: role?.name ?? choice,
                    roleId: role?.id
                } as Choice;
            });

        if (choices.length > 24)
            return reply(interaction, { content: "選択肢の数が多すぎます(最大24個)", ephemeral: true });


        const pollOptions = {
            type: args.getString("投票モード", true),
            ownerId: interaction.user.id,
            choices: choices,
            voters: new Map(),
        };

        await sendPoll(interaction, pollOptions);

        await reply(interaction, "投票を開始しました");
    },
});

export const sendPoll = async (interaction: BaseInteraction, options: PollOptions) => {

    const poll = new PollModel(options);

    const res = await poll.save();

    await interaction.channel?.send({
        content: options.type === "char" ? "キャラクターを選択して下さい" : "投票先を選択してください",
        components: buttonToRow([
            ...pollButton.build({ pollId: res._id, choices: options.choices }),
            ...agregatePollButton.build({ pollId: res._id }),
        ]),
    });
}