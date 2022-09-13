import { GatewayIntentBits } from "discord.js"
import { ExtendedClient } from "./structures/Client"

export const client = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    rest: { timeout: 60000 },
})

client.start()