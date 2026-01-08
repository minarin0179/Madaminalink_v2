import { ChannelType, EmbedBuilder, InteractionContextType, SlashCommandBuilder, VoiceChannel } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { buttonToRow } from "../../utils/ButtonToRow";
import { ensureMembers } from "../../utils/ensureMembers";
import joinOrder from "../../components/buttons/joinOrder";
import shuffleOrder from "../../components/buttons/shuffleOrder";

export const NO_USER_MESSAGE = "まだ参加者がいません";
export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("order")
        .setDescription("ランダムでユーザーの順位決めを行います")
        .setContexts(InteractionContextType.Guild)
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

        const { guild } = interaction;
        if (!guild) return;

        const allMembers = await ensureMembers(guild);

        const voiceChannel = args.getChannel("ボイスチャンネル") as VoiceChannel | null;

        const mentionedMembers = [...participants.matchAll(/<@!?(\d+)>/g)].flatMap(
            ([, id]) => allMembers.get(id) ?? []
        );
        const roleMembers = [...participants.matchAll(/<@&(\d+)>/g)].flatMap(([, id]) => [
            ...(guild.roles.cache.get(id)?.members.values() ?? []),
        ]);
        const vcMembers = [...(voiceChannel?.members.values() ?? [])];

        const members = new Set([...mentionedMembers, ...roleMembers, ...vcMembers]);

        const description =
            Array.from(members)
                .map(m => `${m}`)
                .join("\n") || NO_USER_MESSAGE;

        const embed = new EmbedBuilder().setTitle("順番決め").setDescription(description);

        await reply(interaction, {
            embeds: [embed],
            components: buttonToRow([...joinOrder.build(), ...shuffleOrder.build({ author: interaction.member })]),
        });
    },
});
