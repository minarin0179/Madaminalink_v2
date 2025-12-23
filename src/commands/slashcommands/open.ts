import {
    type APIRole,
    type GuildChannel,
    type GuildMember,
    type Role,
    SlashCommandBuilder,
    type User,
} from "discord.js";
import openButton from "../../components/buttons/open";
import { SlashCommand } from "../../structures/SlashCommand";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("open")
        .setDescription("チャンネルを特定のロールに対して公開します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addMentionableOption(option =>
            option
                .setName("公開相手")
                .setDescription("誰に対して公開しますか?")
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("チャンネル")
                .setDescription("どのチャンネルを公開しますか?")
                .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        const mentionable = args.getMentionable("公開相手");
        const channel = args.getChannel("チャンネル") ?? interaction.channel;

        if (!mentionable)
            return reply(interaction, "ロール/メンバーが存在しません");

        if (!channel)
            return reply(interaction, "チャンネルが見つかりませんでした");

        if (!("permissionOverwrites" in channel))
            return reply(interaction, "このチャンネルは権限を編集できません");

        if (!("id" in mentionable)) return; //getMentionableのバグが直ったら削除

        await channel.permissionOverwrites.edit(mentionable.id, {
            ViewChannel: false,
        });

        await interaction.channel?.send(openMessage(channel, mentionable));

        await reply(interaction, "ボタンを作成しました");
    },
});

export const openMessage = (
    channel: GuildChannel,
    mentionable: GuildMember | Role | APIRole | User
) => {
    return {
        content: `ボタンを押すと${channel}を${mentionable}に公開します`,
        components: buttonToRow(openButton.build({ channel, mentionable })),
    };
};
