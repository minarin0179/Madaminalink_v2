import { GatewayIntentBits } from "discord.js";
import { ExtendedClient } from "./structures/Client";

export const client: ExtendedClient = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates],
    rest: { timeout: 60000 },
});

client.start();
