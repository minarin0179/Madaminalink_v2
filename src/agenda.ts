import Agenda from "agenda";
import "dotenv/config";

export const agenda = new Agenda({
    db: { address: `${process.env.MONGODB}/agenda` ?? "" },
});

agenda.on("ready", async () => {
    agenda.start();
    agenda.purge();
    console.log(new Date(), "agenda started");
});
