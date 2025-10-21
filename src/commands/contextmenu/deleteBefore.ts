import {
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  Snowflake,
} from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import { reply } from "../../utils/Reply";
import { deleteMultiMessages } from "../../utils/DeleteMultiMessages";
import { fetchAllMessages } from "../../utils/FetchAllMessages";

export default new ContextMenu({
  danger: true,
  data: new ContextMenuCommandBuilder()
    .setName("これ以前を削除")
    .setType(ApplicationCommandType.Message)
    .setDefaultMemberPermissions(0)
    .setDMPermission(false),
  execute: async ({ interaction }) => {
    if (!interaction.isMessageContextMenuCommand()) return;
    await interaction.deferReply({ ephemeral: true });

    const message = interaction.targetMessage;
    const { channel } = message;

    // This command is guild-only (setDMPermission(false)), so channel should be GuildTextBasedChannel or DM
    if (!channel) {
      await reply(
        interaction,
        "このチャンネルではこのコマンドを使用できません",
      );
      return;
    }

    const before: Snowflake | undefined = message.id;

    const messages = await fetchAllMessages(channel, { before });
    // Type assertion is safe here because of setDMPermission(false)
    await deleteMultiMessages(channel as any, messages);

    await reply(interaction, "メッセージを削除しました");
  },
});
