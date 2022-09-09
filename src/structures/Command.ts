import { ChatInputCommandInteraction, SlashCommandBuilder, ChatInputApplicationCommandData, CommandInteractionOptionResolver } from "discord.js"
import { ExtendedClient } from "../Client"


interface RunOptions {
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction,
    args: CommandInteractionOptionResolver
}

type RunFunction = (options: RunOptions) => Promise<void>

interface CommandType {
    data: SlashCommandBuilder,
    execute: RunFunction
}

export class Command implements CommandType {

    data: SlashCommandBuilder
    execute: RunFunction

    constructor(command: CommandType) {
        this.data = command.data
        this.execute = command.execute
    }
}