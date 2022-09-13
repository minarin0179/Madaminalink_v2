import { CommandInteraction, InteractionReplyOptions, InteractionResponse, Message, MessageComponentInteraction } from "discord.js";
/* 
export const reply = (async (interaction: CommandInteraction | MessageComponentInteraction, options: InteractionReplyOptions) => {
    try {
        options.ephemeral = options.ephemeral ?? true
        if (interaction.replied) {
            await interaction.followUp(options)
        } else {
            await interaction.reply(options)
        }

    } catch (e) {
        console.error(e)
    }
}) */


export async function reply(interaction: CommandInteraction | MessageComponentInteraction, options: InteractionReplyOptions | string): Promise<Message | InteractionResponse | undefined> {

    try {
        if (typeof options === 'string') {
            options = { content: options }
        }
        options.ephemeral = options.ephemeral ?? true

        if (interaction.replied) {
            return interaction.followUp(options)
        } else {
            return interaction.reply(options)
        }

    } catch (e) {
        console.error(e)
        return
    }
}