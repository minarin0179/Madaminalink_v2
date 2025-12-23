import type {
    CommandInteraction,
    InteractionReplyOptions,
    InteractionResponse,
    Message,
    MessageComponentInteraction,
    ModalSubmitInteraction,
} from "discord.js";

export async function reply(
    interaction:
        | CommandInteraction
        | MessageComponentInteraction
        | ModalSubmitInteraction,
    options: InteractionReplyOptions | string
): Promise<Message | InteractionResponse | undefined> {
    try {
        if (typeof options === "string") {
            options = { content: options };
        }
        options.ephemeral = options.ephemeral ?? true;

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp(options);
        } else {
            return interaction.reply(options);
        }
    } catch (e) {
        return;
    }
}
