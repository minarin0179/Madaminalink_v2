import { CommandInteractionOptionResolver, CommandInteraction } from "discord.js"
import { ExtendedClient } from "./Client"


export interface RunOptions {
    client: ExtendedClient,
    interaction: CommandInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: any) => Promise<any>

interface CommandType {
    data: any,
    execute: RunFunction
    dev?: boolean
}

export class Command implements CommandType {

    data: any
    execute: RunFunction
    dev?: boolean | undefined

    constructor(command: CommandType) {
        this.data = command.data
        this.execute = command.execute
        this.dev = command.dev
    }
}