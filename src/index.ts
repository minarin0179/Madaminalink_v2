import { ShardingManager } from "discord.js";
import "dotenv/config";

//sharding typescript file

const manager = new ShardingManager("./src/bot.ts", {
    token: process.env.TOKEN,
    respawn: true,
});

manager.on("shardCreate", shard => {
    console.log(`Launched shard ${shard.id}`);

    setInterval(
        () => {
            const used = process.memoryUsage();
            const messages = [];
            for (const key in used) {
                messages.push(`${key}: ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`);
            }
            console.log(new Date(), `shardid: ${shard.id},`, messages.join(", "));
        },
        10 * 60 * 1000
    );
});

manager.spawn({ timeout: 60000 });
