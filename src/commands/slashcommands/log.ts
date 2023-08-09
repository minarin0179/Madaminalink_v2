import {
    ChannelType,
    SlashCommandBuilder,
    VoiceBasedChannel,
    TextChannel,
    GuildMember,
    PermissionsBitField,
    OverwriteResolvable,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("log")
        .setDescription("プレイ後のチャンネルを非表示にします")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .addChannelTypes(ChannelType.GuildCategory)
                .setName("非表示にするカテゴリ")
                .setDescription("非表示にするカテゴリ")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("閲覧用ロール").setDescription("閲覧用ロールにのみ見えるようにします").setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        if (!interaction.guild) return;
        await interaction.deferReply({ ephemeral: true });

        const category = await args.getChannel<ChannelType.GuildCategory>("非表示にするカテゴリ", true).fetch();
        const role = args.getRole("閲覧用ロール");

        // VCを削除
        const voiceChannels = category.children.cache.filter((ch): ch is VoiceBasedChannel => ch.isVoiceBased());
        await Promise.all(voiceChannels.map(ch => ch.delete()));

        const textChannels = await Promise.all(
            category.children.cache
                .filter((ch): ch is TextChannel => ch.type == ChannelType.GuildText)
                .map(ch => ch.fetch())
        );

        const lastMessages = (await Promise.all(textChannels.map(ch => ch.messages.fetch()))).map(m => m.first());

        const lastMessageDates = lastMessages.reduce((last, msg) => {
            const date = msg?.createdAt ?? new Date(0);
            return date > last ? date : last;
        }, new Date(0));

        await category.edit({ name: `(${lastMessageDates.toLocaleDateString("ja-JP")}) ${category.name}` });

        await Promise.all(
            textChannels.map(ch => {
                const member = mostActiveMember(ch);
                if (!member) return;
                return ch.edit({ name: `${ch.name} - ${member?.user.globalName}` });
            })
        );

        const perm: OverwriteResolvable[] = [
            {
                id: interaction.guild.roles.everyone.id,
                deny: PermissionsBitField.Flags.ViewChannel,
            },
        ];

        if (role) {
            perm.push({
                id: role.id,
                allow: PermissionsBitField.Flags.ViewChannel,
            });
        }

        await category.permissionOverwrites.set(perm);
        await Promise.all(category.children.cache.map(ch => ch.lockPermissions()));

        await reply(interaction, "完了しました");
    },
});

const mostActiveMember = (textChannel: TextChannel): GuildMember | null => {
    const messages = textChannel.messages.cache;
    const messageCount = new Map<GuildMember, number>();

    messages.forEach(({ member }) => {
        if (member) {
            const count = messageCount.get(member) ?? 0;
            messageCount.set(member, count + 1);
        }
    });

    if (messageCount.size == 0) return null;

    const [maxMember, count] = [...messageCount.entries()].reduce((max, [member, count]) =>
        count > max[1] ? [member, count] : max
    );

    if (maxMember?.user.bot) return null; // botは除外
    if (maxMember?.permissions.has(PermissionsBitField.Flags.Administrator)) return null; // 管理者も除外
    if (count < messages.size / 2) return null; // 半分以上のメッセージを送信していない場合は除外
    return maxMember;
};
