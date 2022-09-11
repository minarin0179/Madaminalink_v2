import { CommandInteractionOptionResolver, CommandInteraction } from "discord.js"
import { ExtendedClient } from "./Client"


export interface RunOptions {
    client: ExtendedClient,
    interaction: CommandInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: any) => Promise<void>

interface CommandType {
    data: any,
    execute: RunFunction
}

export class Command implements CommandType {

    data: any
    execute: RunFunction

    constructor(command: CommandType) {
        this.data = command.data
        this.execute = command.execute
    }
}