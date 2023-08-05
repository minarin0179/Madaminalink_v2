import { ClientEvents } from "discord.js";

export class Event<key extends keyof ClientEvents> {
    constructor(
        public name: key,
        public execute: (...args: ClientEvents[key]) => Promise<void>
    ) {}
}
