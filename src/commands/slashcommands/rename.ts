import { GatewayRateLimitError, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { generateGatewayLimitMessage } from "../../utils/generateGatewayLimitMessage";
import { reply } from "../../utils/Reply";
import { MyConstants } from "../../constants/constants";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("rename")
        .setDescription("ニックネームを一括で変更します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addRoleOption(option =>
            option.setName("ロール").setDescription("ニックネームをリセットするロール").setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("先頭につける文字")
                .setDescription(
                    "「先頭につける文字@ユーザー名」の形式に変更します(指定しなかった場合はニックネームをリセット)"
                )
                .setRequired(false)
        )
        .addStringOption(option =>
            option
                .setName("元の名前に戻す")
                .setDescription("元のユーザー名にニックネームを戻しますか")
                .setRequired(false)
                .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        try {
            await interaction.guild?.members.fetch();
        } catch (error) {
            if (!(error instanceof GatewayRateLimitError)) {
                throw error;
            }
            await reply(interaction, generateGatewayLimitMessage(error.data.retry_after));
            return;
        }

        const role = args.getRole("ロール", true) as Role;
        const prefix = args.getString("先頭につける文字");
        const isReset = args.getString("ユーザー名に戻す") == "true";
        const failed: string[] = [];

        await Promise.all(
            role.members.map(async member =>
                (isReset ? member.setNickname(null) : rename(member, prefix)).catch(() => failed.push(`${member}`))
            )
        );
        await reply(interaction, "ニックネームのリセットが完了しました");

        if (failed.length > 0) {
            await reply(interaction, `ニックネームの変更に失敗したメンバー: ${failed.join(", ")}`);
        }
    },
});

export const rename = async (member: GuildMember, prefix?: string | null) => {
    const nickname = member.nickname?.replace("＠", "@");
    //@より後ろの名前
    const name = nickname?.substring(nickname.lastIndexOf("@") + 1) || member.user.globalName || member.user.username;
    let newName = !prefix ? name : `${prefix}@${name}`;
    if (newName.length > MyConstants.maxNicknameLength) {
        newName = newName.substring(0, MyConstants.maxNicknameLength - 1) + "…";
    }
    return member.setNickname(newName);
};
