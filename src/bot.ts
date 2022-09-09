import { GatewayIntentBits } from "discord.js"
import { ExtendedClient } from "./Client"

export const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds] })

client.start()