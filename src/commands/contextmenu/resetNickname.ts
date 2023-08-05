import { ApplicationCommandType, ContextMenuCommandBuilder, GuildMember, PermissionFlagsBits } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import { reply } from "../../utils/Reply";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName("ニックネームをリセット")
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionFlagsBits.ChangeNickname)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isUserContextMenuCommand()) return;

        const member = interaction.targetMember as GuildMember;

        await member
            .setNickname(null)
            .then(async () => await reply(interaction, "ニックネームをリセットしました"))
            .catch(async () => await reply(interaction, "ニックネームを変更できませんでした"));
    },
});
