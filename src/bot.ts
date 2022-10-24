import { GatewayIntentBits } from "discord.js"
import { ExtendedClient } from "./structures/Client"

export const client = new ExtendedClient({
    shards: 'auto',
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    rest: { timeout: 60000 },
})

client.start()