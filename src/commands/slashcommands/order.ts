import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { buttonToRow } from "../../utils/ButtonToRow";
import joinOrder from "../../components/buttons/joinOrder";
import shuffleOrder from "../../components/buttons/shuffleOrder";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("order")
        .setDescription("ランダムでユーザーの順位付けを行います")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(option =>
            option.setName("参加者").setDescription("ユーザー，ロールを並べ替えに追加できます").setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName("ボイスチャンネル")
                .setDescription("ボイスチャンネルにいるメンバーを並べ替えに追加します")
                .setRequired(false)
                .addChannelTypes(ChannelType.GuildVoice)
        ),
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: false });
        const participants = args.getString("参加者", true);

        const membersRegex = /<@!?(\d+)>/g;
        const roleRegex = /<@&(\d+)>/g;
        const voiceChannelRegex = /<#(\d+)>/g;

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

        const voiceChannelIDs = Array.from(participants.matchAll(voiceChannelRegex), m => m[1]);
        const voiceChannels =
            voiceChannelIDs
                ?.map(channel_id => guild.channels.cache.get(channel_id))
                .filter(ch => ch?.type === ChannelType.GuildVoice) || [];

        voiceChannels.map(vc => {
            vc.members.map(m => {
                members.add(m);
            });
        });
        const embed = new EmbedBuilder().setTitle("並べ替え候補").setDescription(
            Array.from(members).map(m => `${m}`).join("\n"));

        await reply(interaction, {
            embeds: [embed],
            components: buttonToRow([...joinOrder.build(), ...shuffleOrder.build()]),
        });
    },
});
