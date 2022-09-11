import { ApplicationCommandType, ContextMenuCommandBuilder } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import editModal from "../../components/modal/editModal";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName('メッセージを編集')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction, args }) => {
        if (!interaction.isMessageContextMenuCommand()) return

        const message = interaction.targetMessage

        if (!message.editable) {
            await interaction.reply({
                content: 'このメッセージは編集できません',
                ephemeral: true
            })
            return
        }

        await interaction.showModal(editModal.build({ message }))
    }
})