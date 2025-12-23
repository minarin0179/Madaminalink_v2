import type { GuildChannel } from "discord.js";

export type ChannelLink = {
    before: GuildChannel;
    after: GuildChannel;
};
