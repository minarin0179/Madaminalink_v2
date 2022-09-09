import { ClientEvents } from "discord.js"

/*
type RunEventFunction = (options: EventOptions) => Promise<void>

interface EventType {
    name: string,
    once: boolean,
    execute: RunEventFunction
}


export class Event implements EventType {
    name: string
    once: boolean
    execute: RunEventFunction

    constructor(event: EventType) {
        this.name = event.name
        this.once = event.once
        this.execute = event.execute
    }
}*/

export class Event<key extends keyof ClientEvents>{
    constructor(
        public name: key,
        public execute: (...args: ClientEvents[key]) => Promise<void>
    ) { }
}