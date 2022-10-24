import Agenda from "agenda";
import 'dotenv/config'
import { client } from './bot'

export const agenda = new Agenda({ db: { address: process.env.mongodb ?? '' } });

agenda.on("ready", async ()=> {
    agenda.start()
    agenda.purge()
    console.log(new Date(), 'agenda started');
})