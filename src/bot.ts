import { GatewayIntentBits, Options } from "discord.js";
import { ExtendedClient } from "./structures/Client";

export const client: ExtendedClient = new ExtendedClient({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates],
    rest: { timeout: 60000 },
    makeCache: Options.cacheWithLimits({
        ...Options.DefaultMakeCacheSettings,
        AutoModerationRuleManager: 0,
        ApplicationCommandManager: 50,
        BaseGuildEmojiManager: 0,
        DMMessageManager: 0,
        GuildEmojiManager: 0,
        GuildMemberManager: 200,
        GuildBanManager: 0,
        GuildForumThreadManager: 0,
        GuildInviteManager: 0,
        GuildMessageManager: 200,
        GuildScheduledEventManager: 0,
        GuildStickerManager: 0,
        GuildTextThreadManager: 0,
        MessageManager: 200,
        PresenceManager: 0,
        ReactionManager: 100,
        StageInstanceManager: 0,
        ThreadManager: 0,
        ThreadMemberManager: 0,
        UserManager: 200,
        VoiceStateManager: 50,
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
