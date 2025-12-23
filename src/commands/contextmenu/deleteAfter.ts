import {
    ApplicationCommandType,
    ContextMenuCommandBuilder,
    type Snowflake,
} from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import { deleteMultiMessages } from "../../utils/DeleteMultiMessages";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";

export default new ContextMenu({
    danger: true,
    data: new ContextMenuCommandBuilder()
        .setName("これ以降を削除")
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction }) => {
        if (!interaction.isMessageContextMenuCommand()) return;
        await interaction.deferReply({ ephemeral: true });

        const message = interaction.targetMessage;
        const { channel } = message;
        const after: Snowflake | undefined = message.id;

        const messages = await fetchAllMessages(channel, { after });
        await deleteMultiMessages(channel, messages);

        await reply(interaction, "メッセージを削除しました");
    },
});
