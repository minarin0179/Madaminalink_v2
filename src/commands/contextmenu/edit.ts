import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import editModal from "../../components/modal/editModal";
import { ContextMenu } from "../../structures/ContextMenu";
import { reply } from "../../utils/Reply";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName("メッセージを編集")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction, args }) => {
        if (!interaction.isMessageContextMenuCommand()) return;

        const message = interaction.targetMessage;

        if (!message.editable)
            return reply(interaction, "このメッセージは編集できません");

        await interaction.showModal(editModal.build({ message }));
    },
});
