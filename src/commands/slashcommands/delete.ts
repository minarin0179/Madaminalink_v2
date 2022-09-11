import { ChannelType, SlashCommandBuilder, CategoryChannel, OverwriteType } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('カテゴリを削除します(カテゴリに含まれるチャンネルも削除されます)')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .addChannelTypes(ChannelType.GuildCategory)
            .setName('削除するカテゴリ')
            .setDescription('削除するカテゴリ')
            .setRequired(true)
        )
        .addStringOption(option => option
            .setName('ロールの削除')
            .setDescription('カテゴリーに付与されたロールを一緒に削除しますか？(デフォルトはいいえ)')
            .setRequired(false)
            .addChoices(
                { name: 'はい', value: 'true' },
                { name: 'いいえ', value: 'false' }
            )
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.reply({
            content: '削除を実行中',
            ephemeral: true
        })

        const category = args.getChannel('削除するカテゴリ') as CategoryChannel
        const deleteRoleIds = new Set<string>()

        await Promise.all(category.children.cache.map(async ch => {
            ch.permissionOverwrites.cache
                .filter(perm => perm.type == OverwriteType.Role)
                .map(perm => deleteRoleIds.add(perm.id))

            await ch.delete()
        }))

        await category.delete()

        if (args.getString('ロールの削除') == 'true') {
            await Promise.all([...deleteRoleIds].map(async id => {
                return (await interaction.guild?.roles.fetch(id))?.delete().catch(e => { })
            }))
        }

        await interaction.followUp({
            content: '削除が完了しました',
            ephemeral: true
        }).catch(() => { })
    }
})