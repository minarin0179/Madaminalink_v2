import { ChatInputCommandInteraction, SlashCommandBuilder, CommandInteractionOptionResolver } from "discord.js";
import { ExtendedClient } from "./Client";
import { Command, RunOptions } from "./Command";

interface SlashCommandRunOptions extends RunOptions {
    client: ExtendedClient;
    interaction: ChatInputCommandInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: SlashCommandRunOptions) => Promise<any>;

interface SlashCommandType {
    data: SlashCommandBuilder;
    execute: RunFunction;
    dev?: boolean;
}

export class SlashCommand extends Command implements SlashCommandType {
    data: SlashCommandBuilder;
    execute: RunFunction;
    dev?: boolean | undefined;

    constructor(command: SlashCommandType) {
        super(command);
        this.data = command.data;
        this.execute = command.execute;
        this.dev = command.dev;
    }
}
