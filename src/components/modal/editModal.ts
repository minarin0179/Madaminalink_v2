import { ActionRowBuilder, ModalActionRowComponentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from "discord.js"
import { Modal } from "../../structures/Modal"


export default new Modal({
    customId: 'edit',
    build: ({ message }) => {
        return new ModalBuilder()
            .setCustomId(`edit:${message.id}`)
            .setTitle('メッセージを編集')
            .addComponents(
                new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
                    new TextInputBuilder()
                        .setCustomId('content')
                        .setLabel('編集内容')
                        .setStyle(TextInputStyle.Paragraph)
                        .setMinLength(1)
                        .setMaxLength(2000)
                        .setPlaceholder('編集後のメッセージを入力')
                        .setRequired(true)
                )
            )
    },
    execute: async ({ interaction, args }) => {
        const [messageId] = args
        const message = await interaction.channel?.messages.fetch(messageId)

        await message?.edit(interaction.fields.getTextInputValue('content'))

        await interaction.reply({ content: '編集が完了しました', ephemeral: true })
    },
})
