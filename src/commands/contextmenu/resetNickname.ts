import { ApplicationCommandType, ContextMenuCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import editModal from "../../components/modal/editModal";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName('ニックネームをリセット')
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isUserContextMenuCommand()) return

        const member = interaction.targetMember as GuildMember

        await member.setNickname(null)
            .then(async () => {
                await interaction.reply({
                    content: 'ニックネームをリセットしました',
                    ephemeral: true,
                });
            }).catch(async () => {
                await interaction.reply({
                    content: 'ニックネームを変更できませんでした',
                    ephemeral: true,
                });
            });
    }
})