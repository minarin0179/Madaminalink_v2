import { Event } from "../structures/Events"

export default new Event('ready', async () => {
    console.log('Ready!')
})