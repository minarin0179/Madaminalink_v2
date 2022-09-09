import { Event } from "../structures/Events"
/*
export default new Event({
    name: 'ready',
    once: true,
    execute: () => {
        console.log('Ready!')
    }
})
*/

export default new Event('ready', async () => {
    console.log('Ready!')
})