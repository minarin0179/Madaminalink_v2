import { ApplicationCommandType, Collection, ContextMenuCommandBuilder, Message } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import { reply } from "../../utils/Reply";
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
        const { channel } = message
        let lastId: string | undefined = message.id

        await message.delete()
        
        while (true) {
            const messages: Collection<string, Message> = await channel.messages.fetch({ limit: 100, after: lastId })
            if (messages.size == 0) break
            lastId = messages.last()?.id
            await deleteMultiMessages(channel, messages)
        }

        await reply(interaction, "メッセージを削除しました")
    }
})