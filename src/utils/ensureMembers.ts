import { Collection, Guild, GuildMember } from "discord.js";

/** 全体で共有: fetchしたギルドを記録 */
const globalFetchedGuilds = new Set<string>();

/**
 * ギルドのメンバー一覧を取得する
 * 一度fetchしたらキャッシュを利用する
 * メンバー操作イベントでキャッシュは自動更新される
 */
export async function ensureMembers(guild: Guild): Promise<Collection<string, GuildMember>> {
    if (globalFetchedGuilds.has(guild.id)) {
        return guild.members.cache;
    }

    const members = await guild.members.fetch();
    globalFetchedGuilds.add(guild.id);
    return members;
}
