import { ChatInputCommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver } from "discord.js"
import { ExtendedClient } from "./Client"
import { Command, RunOptions } from "./Command"


interface SlashCommandRunOptions extends RunOptions {
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: SlashCommandRunOptions) => Promise<void>

interface SlashCommandType {
    data: SlashCommandBuilder,
    execute: RunFunction
}

export class SlashCommand extends Command implements SlashCommandType {

    data: SlashCommandBuilder
    execute: RunFunction

    constructor(command: SlashCommandType) {
        super(command)
        this.data = command.data
        this.execute = command.execute
    }
}