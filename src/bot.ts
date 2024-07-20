import { GatewayIntentBits, Options } from "discord.js";
import { ExtendedClient } from "./structures/Client";

export const client: ExtendedClient = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    rest: { timeout: 60000 },
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
    }),

    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 1800,
            lifetime: 900,
        },
        threads: {
            interval: 1800,
            lifetime: 900,
        },
        users: {
            interval: 3600,
            filter: () => user => user.bot && user.id !== user.client.user.id,
        },
        guildMembers: {
            interval: 3600,
            filter: () => member => member.user.bot && member.user.id !== member.client.user.id,
        },
    },
});

client.start();
