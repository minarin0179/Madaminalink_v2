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
import { getFirstButtonCustomId } from "../../utils/getFirstButtonCustomId";
import { LimitLength } from "../../utils/LimitLength";
import { reply } from "../../utils/Reply";
import { transferMessage } from "../../utils/transferMessage";

export default new Button({
    customId: "transfer",
    build: ({ destination }: { destination: GuildTextBasedChannel }) => [
        new ButtonBuilder()
            .setCustomId(`transfer:${destination.id}`)
            .setLabel(`「#${LimitLength(destination.name, 32)}」へ転送`)
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setLabel('転送先')
            .setStyle(ButtonStyle.Link)
            .setURL(destination.url)
    ],
    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const destinations: GuildTextBasedChannel[] = args
            .map(id => interaction.guild?.channels.cache.get(id))
            .filter((channel): channel is NewsChannel | TextChannel | VoiceChannel => channel?.isTextBased() ?? false);
        interaction.channel?.messages.cache.clear();
        const reactions = (await interaction.message.fetch()).reactions.cache;

        const messages = (await fetchAllMessages(interaction.channel as TextBasedChannel))
            .reverse()
            .filter(message => !getFirstButtonCustomId(message)?.startsWith("transfer"));

        if (!messages) return;

        let count = 0;
        for await (const message of messages.values()) {
            const keys = message.reactions.cache.keys();
            if (reactions.hasAny(...keys)) {
                await Promise.all(
                    destinations.map(async destination => transferMessage(message, destination, { noReaction: true }))
                );
                count++;
            }
        }
        if (count > 0) await reply(interaction, `${count}件のメッセージを転送しました`);
        else await reply(interaction, "転送するメッセージがありませんでした");
    },
});
