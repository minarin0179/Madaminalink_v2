import { Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('rename')
        .setDescription('ニックネームを一括でリセットします')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addRoleOption(option => option
            .setName('ロール')
            .setDescription('ニックネームをリセットするロール')
            .setRequired(true)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })

        await interaction.guild?.members.fetch()

        const role = args.getRole('ロール', true) as Role

        const failed: string[] = []
        await Promise.all(role.members.filter(member => !!member.nickname).map(async member => {
            await member.setNickname(null).catch(() => failed.push(`${member}`))
        }))

        await reply(interaction, 'ニックネームのリセットが完了しました')

        if (failed.length > 0) {
            await reply(interaction, `ニックネームの変更に失敗したメンバー: ${failed.join(', ')}`)
        }
    }
})