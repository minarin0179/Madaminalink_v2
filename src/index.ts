import { ShardingManager } from "discord.js";
import "dotenv/config";

//sharding typescript file

const manager = new ShardingManager("./src/bot.ts", {
    token: process.env.TOKEN,
    respawn: true,
});

manager.on("shardCreate", shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();
