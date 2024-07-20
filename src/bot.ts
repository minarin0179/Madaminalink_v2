import { GatewayIntentBits, Options } from "discord.js";
import { ExtendedClient } from "./structures/Client";

export const client: ExtendedClient = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates],
    rest: { timeout: 60000 },
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
    }),

    sweepers: {
        ...Options.DefaultSweeperSettings,
        messages: {
            interval: 18_000,
            lifetime: 9_000,
        },
        threads: {
            interval: 18_000,
            lifetime: 9_000,
        },
        users: {
            interval: 3_600,
            filter: () => user => user.bot && user.id !== user.client.user.id,
        },
        guildMembers: {
            interval: 3_600,
            filter: () => member => member.user.bot && member.user.id !== member.client.user.id,
        },
    },
});

client.start();
