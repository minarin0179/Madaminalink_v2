import {
    ButtonBuilder,
    ButtonStyle,
    TextChannel,
    GuildTextBasedChannel,
    NewsChannel,
    VoiceChannel,
    TextBasedChannel,
} from "discord.js";
import { Button } from "../../structures/Button";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";
import { transferMessage } from "../../utils/transferMessage";

export default new Button({
    customId: "transfer",
    build: ({ destination }: { destination: GuildTextBasedChannel }) => [
        new ButtonBuilder()
            .setCustomId(`transfer:${destination.id}`)
            .setLabel(`「#${destination.name}」へ転送`)
            .setStyle(ButtonStyle.Primary),
    ],
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const destinations: GuildTextBasedChannel[] = args
            .map(id => interaction.guild?.channels.cache.get(id))
            .filter((channel): channel is NewsChannel | TextChannel | VoiceChannel => channel?.isTextBased() ?? false);
        interaction.channel?.messages.cache.clear();
        const reactions = (await interaction.message.fetch()).reactions.cache;

        const messages = (await fetchAllMessages(interaction.channel as TextBasedChannel)).reverse().filter(message => {
            const customId = message.components[0]?.components[0]?.customId;
            return !customId?.startsWith("transfer"); //転送用のボタンが付いたメッセージは無視
        });

        if (!messages) return;

        let count = 0;
        for await (const message of messages.values()) {
            const keys = message.reactions.cache.keys();
            if (reactions.hasAny(...keys)) {
                await Promise.all(
                    destinations.map(async destination => {
                        await transferMessage(message, destination, { noReaction: true });
                    })
                );
                count++;
            }
        }
        if (count > 0) await reply(interaction, `${count}件のメッセージを転送しました`);
        else await reply(interaction, "転送するメッセージがありませんでした");
    },
});
