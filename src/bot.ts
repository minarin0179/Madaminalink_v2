import { GatewayIntentBits, Options } from "discord.js"
import { ExtendedClient } from "./structures/Client"

export const client: ExtendedClient = new ExtendedClient({
    shards: 'auto',
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates
    ],
    rest: { timeout: 60000 },
    makeCache: Options.cacheWithLimits({
        MessageManager: 100,
        GuildMemberManager: {
            maxSize: 100,
            keepOverLimit: member => member.id === client.user?.id
        }
    })
})

client.start()