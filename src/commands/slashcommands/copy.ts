import { ChannelType, GuildChannel, GuildChannelCloneOptions, MessageFlags, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { isCategory } from "../../utils/isCategory";
import { reply } from "../../utils/Reply";
import { transferAllMessages } from "../../utils/transferMessage";
import { ChannelLink } from "../../structures/ChannelLink";

const OPTION_NAME_NEED_MESSAGE_COPY = "メッセージを複製しない";

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
        )
        .addStringOption(option =>
            option
                .setName(OPTION_NAME_NEED_MESSAGE_COPY)
                .setDescription("チャンネルは複製されますが、メッセージは複製されません")
                .setRequired(false)
                .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const originalChannel = (args.getChannel("対象") ?? interaction.channel) as GuildChannel;

        const channelLinks = await duplicateChannel(originalChannel);

        if (args.getString(OPTION_NAME_NEED_MESSAGE_COPY) !== "true") {
            await Promise.all(
                channelLinks.map(async ({ before, after }) =>
                    transferAllMessages(before, after, {
                        allowedMentions: { parse: [] },
                        updates: channelLinks,
                        flags: [MessageFlags.SuppressNotifications],
                    })
                )
            );
        }

        await reply(interaction, `「${originalChannel.name}」のコピーが完了しました`);
    },
});

/**
 * originalChannel:GuildChannel -> [[originalChannel,newChannel]]
 * originalChannel:CategoryChannel -> [...[originalChannel,newChannel]]
 */

const duplicateChannel = async (
    originalChannel: GuildChannel,
    option?: GuildChannelCloneOptions
): Promise<ChannelLink[]> => {
    if (isCategory(originalChannel)) {
        // originalChannel.guild.channels.cache.sizeだとスレッドチャンネル数も含まれる
        if (originalChannel.children.cache.size + 1 + (await originalChannel.guild.channels.fetch()).size > 500) {
            const error = new Error("Maximum number of guild channels reached (500)") as any;
            error.code = 30013;
            throw error;
        }

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
