import { ApplicationCommandType, ContextMenuCommandBuilder, GuildTextBasedChannel } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import editModal from "../../components/modal/editModal";
import { reply } from "../../utils/Reply";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { deleteMultiMessages } from "../../utils/DeleteMultiMessages";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName('これ以降を削除')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isMessageContextMenuCommand()) return
        await interaction.deferReply({ ephemeral: true })

        const message = interaction.targetMessage
        const targetMessages = (await fetchAllMessages(message.channel)).filter(m => m.createdTimestamp >= message.createdTimestamp)

        await deleteMultiMessages(message.channel as GuildTextBasedChannel, targetMessages)

        await reply(interaction, "メッセージを削除しました")
    }
})