import { ChannelType, GuildChannel, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { isCategory } from "../../utils/isCategory";
import { reply } from "../../utils/Reply";
import { transferAllMessages } from "../../utils/transferMessage";
import { ChannelLink } from "../../structures/ChannelLink";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("copy")
        .setDescription("チャンネルを複製します(メッセージを含む)")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .setName("対象")
                .setDescription("コピーするチャンネル/カテゴリー")
                .addChannelTypes(ChannelType.GuildCategory, ChannelType.GuildText)
                .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const originalChannel = (args.getChannel("対象") ?? interaction.channel) as GuildChannel;

        const channelLinks = await duplicateChannel(originalChannel);

        await Promise.all(
            channelLinks.map(async ({ before, after }) =>
                transferAllMessages(before, after, {
                    allowedMentions: { parse: [] },
                    updates: channelLinks,
                })
            )
        );

        await reply(interaction, `「${originalChannel.name}」のコピーが完了しました`);
    },
});

/**
 * originalChannel:GuildChannel -> [[originalChannel,newChannel]]
 * originalChannel:CategoryChannel -> [...[originalChannel,newChannel]]
 */

const duplicateChannel = async (originalChannel: GuildChannel, option?: any): Promise<ChannelLink[]> => {
    if (isCategory(originalChannel)) {
        const newCategory = await originalChannel.clone({
            name: `(copy) ${originalChannel.name}`,
            type: ChannelType.GuildCategory,
        });

        const channelLinks = await Promise.all(
            originalChannel.children.cache.map(
                async c => await duplicateChannel(c, { name: c.name, parent: newCategory })
            )
        );

        return channelLinks.flat();
    }

    const newChannel = await originalChannel.clone({
        name: `(copy) ${originalChannel.name}`,
        ...option,
    });

    if (originalChannel.isTextBased() && newChannel.isTextBased()) {
        if ("topic" in originalChannel && "topic" in newChannel) {
            newChannel.topic = originalChannel.topic || "";
        }
        newChannel.setNSFW(originalChannel.nsfw);
        newChannel.setRateLimitPerUser(originalChannel.rateLimitPerUser || 0);
    }

    return [{ before: originalChannel, after: newChannel }];
};
