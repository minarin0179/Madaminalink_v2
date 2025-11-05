import {
    CommandInteraction,
    InteractionReplyOptions,
    InteractionResponse,
    Message,
    MessageComponentInteraction,
    MessageFlags,
    ModalSubmitInteraction,
} from "discord.js";

/**
 * ephemeralプロパティをサポートするReplyオプション型
 * Discord.jsのInteractionReplyOptionsを拡張し、ephemeralパラメータを内部でFlagsに変換します
 */
type ReplyOptions = Omit<InteractionReplyOptions, "ephemeral"> & {
    /**
     * メッセージを一時的（ephemeral）にするかどうか
     * - true: メッセージは実行ユーザーにのみ表示されます（デフォルト）
     * - false: メッセージは全員に表示されます
     */
    ephemeral?: boolean;
};

export async function reply(
    interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    options: ReplyOptions | string
): Promise<Message | InteractionResponse | undefined> {
    try {
        if (typeof options === "string") {
            options = { content: options };
        }

        // ephemeralパラメータをflagsに変換（デフォルトはtrue）
        const shouldBeEphemeral = options.ephemeral ?? true;

        // ephemeralプロパティを削除（非推奨のため使用しない）
        const { ephemeral, ...rest } = options;

        // flagsを使ってephemeralを設定
        const replyOptions: InteractionReplyOptions = shouldBeEphemeral
            ? {
                  ...rest,
                  flags: rest.flags ? rest.flags | MessageFlags.Ephemeral : MessageFlags.Ephemeral,
              }
            : rest;

        if (interaction.replied || interaction.deferred) {
            return interaction.followUp(replyOptions);
        } else {
            return interaction.reply(replyOptions);
        }
    } catch (e) {
        return;
    }
}
