import { Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('ニックネームを一括で変更します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addRoleOption(option => option
            .setName('ロール')
            .setDescription('ニックネームをリセットするロール')
            .setRequired(true)
        ).addStringOption(option => option
            .setName('先頭につける文字')
            .setDescription('「先頭につける文字@ユーザー名」の形式に変更します(指定しなかった場合はニックネームをリセット)')
            .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })

        await interaction.guild?.members.fetch()

        const role = args.getRole('ロール', true) as Role
        const prefix = args.getString('先頭につける文字')
        const failed: string[] = []
        await Promise.all(role.members.map(async member => {
            const nickname = member.nickname?.replace('＠', '@')
            //@より後ろの名前
            const name = nickname?.substring(nickname.lastIndexOf('@') + 1) || member.user.username

            return await member.setNickname(!prefix ? name : `${prefix}@${name}`)
                .catch(() => failed.push(`${member}`))
        }))

        await reply(interaction, 'ニックネームのリセットが完了しました')

        if (failed.length > 0) {
            await reply(interaction, `ニックネームの変更に失敗したメンバー: ${failed.join(', ')}`)
        }
    }
})