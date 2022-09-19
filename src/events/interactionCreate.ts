import { Colors, EmbedBuilder } from "discord.js"
import { client } from "../bot"
import { Event } from "../structures/Events"
import { reply } from "../utils/Reply"

export default new Event('interactionCreate', async (interaction) => {

    //スラッシュコマンド
    if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute({ client, interaction, args: interaction.options })
        } catch (e) {
            await reply(interaction, {
                content: 'エラーが発生しました、下記のエラーメッセージを添えて報告して下さい',
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    //@ts-ignore
                    .setDescription(e.stack)
                ]
            })
        }
    }

    //コンポーネント
    else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
        const [customId, ...args] = interaction.customId.split(/[;:,]/)
        const component = client.components.get(customId)
        if (!component) return
        try {
            await component.execute({ client, interaction, args })

        } catch (e) {
            await reply(interaction, {
                content: 'エラーが発生しました、下記のエラーメッセージを添えて報告して下さい',
                embeds: [new EmbedBuilder()
                    .setColor(Colors.Red)
                    //@ts-ignore
                    .setDescription(e.stack)
                ]
            })
        }
    }
})