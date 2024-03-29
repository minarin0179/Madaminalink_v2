import { ShardingManager } from "discord.js";
import "dotenv/config";

const manager = new ShardingManager("./dist/bot.js", {
    token: process.env.TOKEN,
    respawn: true,
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
