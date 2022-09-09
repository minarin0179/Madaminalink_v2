import { client } from "../bot"
import { Event } from "../structures/Events"

export default new Event('interactionCreate', async (interaction) => {

    //スラッシュコマンド
    if (interaction.isChatInputCommand()) {
        const command = client.commands.get(interaction.commandName)
        if (!command) return
        try {
            await command.execute({ client, interaction, args: interaction.options })
        } catch (e) {
            console.error(e)
        }
    }

    //コンポーネント
    else if (interaction.isMessageComponent()) {
        const [customId, ...args] = interaction.customId.split(/[;:,]/)
        const component = client.components.get(customId)
        if (!component) return
        await component.execute({ client, interaction, args })
    }
})