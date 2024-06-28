import { ChannelType, EmbedBuilder, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { buttonToRow } from "../../utils/ButtonToRow";
import joinOrder from "../../components/buttons/joinOrder";
import shuffleOrder from "../../components/buttons/shuffleOrder";

export const NO_USER_MESSAGE = "まだ参加者がいません";
export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("order")
        .setDescription("ランダムでユーザーの順位決めを行います")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("ユーザーまたはロール").setDescription("ユーザー，ロールを並べ替えに追加できます")
        )
        .addChannelOption(option =>
            option
                .setName("ボイスチャンネル")
                .setDescription("ボイスチャンネルにいるメンバーを並べ替えに追加します")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildVoice)
        ) as SlashCommandBuilder,
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: false });
        const participants = args.getString("ユーザーまたはロール") || "";

        const membersRegex = /<@!?(\d+)>/g;
        const roleRegex = /<@&(\d+)>/g;

        const { guild } = interaction;
        if (!guild) return;

        await guild.members.fetch();

        const memberIDs = Array.from(participants.matchAll(membersRegex), m => m[1]);
        const members = new Set(memberIDs?.map(user_id => guild.members.cache.get(user_id)).filter(m => !!m) || []);

        const roleIDs = Array.from(participants.matchAll(roleRegex), m => m[1]);
        const roles = roleIDs?.map(role_id => guild.roles.cache.get(role_id)).filter(r => !!r) || [];
        roles.map(role => {
            role.members.map(m => {
                members.add(m);
            });
        });

        const voiceChannel = args.getChannel("ボイスチャンネル") as VoiceChannel | null;
        voiceChannel?.members.map(member => members.add(member));

        const description =
            Array.from(members)
                .map(m => `${m}`)
                .join("\n") || NO_USER_MESSAGE;

        const embed = new EmbedBuilder().setTitle("順番決め").setDescription(description);

        await reply(interaction, {
            embeds: [embed],
            components: buttonToRow([...joinOrder.build(), ...shuffleOrder.build()]),
        });
    },
});
