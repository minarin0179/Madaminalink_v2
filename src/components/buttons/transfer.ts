import {
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    TextChannel,
    GuildTextBasedChannel,
    Message,
    NewsChannel,
    VoiceChannel,
    TextBasedChannel,
} from "discord.js";
import { MyConstants } from "../../constants/constants";
import { Button } from "../../structures/Button";
import { fetchAllMessages } from "../../utils/FetchAllMessages";
import { reply } from "../../utils/Reply";
import { transferMessage } from "../../utils/transferMessage";
import { LimitLength } from "../../utils/LimitLength";

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

        const messages = (await fetchAllMessages(interaction.channel as TextBasedChannel)).reverse().filter(message => {
            const customId = message.components[0]?.components[0]?.customId;
            return !customId?.startsWith("transfer"); //転送用のボタンが付いたメッセージは無視
        });

        if (!messages) return;

        let count = 0;
        // TODO 活用できてない
        let errorCount = 0;
        // try {
        for await (const message of messages.values()) {
            const keys = message.reactions.cache.keys();
            if (reactions.hasAny(...keys)) {
                await Promise.all(
                    destinations.map(async destination => 
                        // {
                        isFetchedFilesizeOK(message, destination, interaction)
                        // transferMessage(message, destination, { noReaction: true })
                        // ;
//                         const largeFiles = await transferMessage(message, destination, { noReaction: true });
//                         if (largeFiles != undefined) {
//                             await reply(
//                                 interaction,
//                                 `\`\`\`diff
// - ${largeFiles.map(file => file.name).join(", ")}のコピーに失敗しました
// - ファイル容量の上限は${MyConstants.maxFileSizeMB}MBです\`\`\``
//                             );
//                             errorCount += largeFiles.size;
//                         }
                    // }
                )
                );
                count++;
            }
        }
        // } catch (e: any) {
        //     console.log(e);
        //     errorCount++;
        // }
        if (count > 0) await reply(interaction, `${count}件のメッセージを転送しました`);
        else await reply(interaction, "転送するメッセージがありませんでした");
        // TODO ephemeral になってるけど設計思想的にいいのか
        if (errorCount > 0)
            await reply(
                interaction,
                `\`\`\`diff
- ${errorCount}件のファイルの転送に失敗しています
- 詳しくは上部をご確認ください\`\`\``
            );
    },
});

const isFetchedFilesizeOK = async (
    message: Message,
    destination: GuildTextBasedChannel,
    interaction: ButtonInteraction
) => {
    // transferMessage(message, destination, { noReaction: true });
    // ;
    const largeFiles = await transferMessage(message, destination, { noReaction: true });
    if (largeFiles != undefined) {
        await reply(
            interaction,
            `\`\`\`diff
- ${largeFiles.map(file => file.name).join(", ")}のコピーに失敗しました
- ファイル容量の上限は${MyConstants.maxFileSizeMB}MBです\`\`\``
        );
        // errorCount += largeFiles.size;
        // };
    }
};
