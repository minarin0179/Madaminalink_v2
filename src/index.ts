import { ShardingManager } from "discord.js";
import "dotenv/config";
import { generateHeapSnapshot } from "bun";
import fs from "fs";

//sharding typescript file

const manager = new ShardingManager("./src/bot.ts", {
    token: process.env.TOKEN,
    respawn: true,
});

manager.on("shardCreate", shard => {
    console.log(`Launched shard ${shard.id}`);
    setInterval(
        () => {
            const filename = `heap-shard-${shard.id}-${Date.now()}.json`;
            const snapshot = generateHeapSnapshot();
            console.log(`Writing heap snapshot to ${filename}`);
            fs.writeFileSync(filename, JSON.stringify(snapshot, null, 2));
        },
        60 * 60 * 1000
    );
});

manager.spawn({ timeout: 60000 });
