import { ApplicationCommandType, ContextMenuCommandBuilder, Embed, EmbedBuilder } from "discord.js";
import { ContextMenu } from "../../structures/ContextMenu";
import editModal from "../../components/modal/editModal";
import { reply } from "../../utils/Reply";

export default new ContextMenu({
    data: new ContextMenuCommandBuilder()
        .setName('/archiveを修正')
        .setType(ApplicationCommandType.Message)
        .setDefaultMemberPermissions(0)
        .setDMPermission(false),
    execute: async ({ interaction, args }) => {
        if (!interaction.isMessageContextMenuCommand()) return

        const message = interaction.targetMessage

        const embed_old: Embed = message.embeds[0]

        const embed: EmbedBuilder = new EmbedBuilder(embed_old.toJSON());

        if (!message.editable || !embed_old?.description) return reply(interaction, 'このメッセージは編集できません')

        embed.setDescription(embed_old?.description.replace(/\[# /g, "[\\# "));

        message.edit({ embeds: [embed] });

        reply(interaction, '修正が完了しました');
    }
})