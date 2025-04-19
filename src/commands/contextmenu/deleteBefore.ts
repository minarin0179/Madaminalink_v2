import { ApplicationCommandType, ContextMenuCommandBuilder, Snowflake } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import { reply } from "../../utils/Reply";
import { deleteMultiMessages } from "../../utils/DeleteMultiMessages";
import { fetchAllMessages } from "../../utils/FetchAllMessages";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName("これ以前を削除 Λ")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isMessageContextMenuCommand()) return;
        await interaction.deferReply({ ephemeral: true });

        const message = interaction.targetMessage;
        const { channel } = message;
        const before: Snowflake | undefined = message.id;

        const messages = await fetchAllMessages(channel, { before });
        await deleteMultiMessages(channel, messages);

        await reply(interaction, "メッセージを削除しました");
    },
});
