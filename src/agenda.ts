import Agenda from "agenda";
import 'dotenv/config'
import { client } from './bot'

export const agenda = new Agenda({ db: { address: process.env.mongodb ?? '' } });

agenda.define('send remind', async (job: any) => {
    const { channelId, authorId, content } = job.attrs.data;
    const channel = await client.channels.fetch(channelId)
    const author = await client.users.fetch(authorId)

    if (!channel || !channel.isTextBased()) return

    try {
        await channel.send(content)
        await job.remove()
    } catch (e) {
        console.log(e)
    }

});

agenda.on("ready", function () {
    agenda.start()
    agenda.purge()
    agenda.cancel({ name: "send remind" });
    console.log(new Date(), 'agenda started');
})