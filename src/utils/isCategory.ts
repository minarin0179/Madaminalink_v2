import {
    type BaseChannel,
    type CategoryChannel,
    ChannelType,
} from "discord.js";

export const isCategory = (
    channel: BaseChannel
): channel is CategoryChannel => {
    return channel.type == ChannelType.GuildCategory;
};
