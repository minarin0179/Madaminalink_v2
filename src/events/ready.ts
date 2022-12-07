import { Events } from "discord.js"
import { Event } from "../structures/Events"

export default new Event(Events.ClientReady, async () => {
    console.log('Ready!')
})