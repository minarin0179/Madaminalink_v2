import { CommandInteractionOptionResolver, ContextMenuCommandInteraction, ContextMenuCommandBuilder } from "discord.js"
import { ExtendedClient } from "./Client"
import { Command, RunOptions } from "./Command"


interface ContextMenuRunOptions extends RunOptions {
    client: ExtendedClient,
    interaction: ContextMenuCommandInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: ContextMenuRunOptions) => Promise<any>

interface ContextMenuType {
    data: ContextMenuCommandBuilder,
    execute: RunFunction
    dev?: boolean | undefined
}

export class ContextMenu extends Command implements ContextMenuType {

    data: ContextMenuCommandBuilder
    execute: RunFunction

    constructor(command: ContextMenuType) {
        super(command)
        this.data = command.data
        this.execute = command.execute
        this.dev = command.dev
    }
}