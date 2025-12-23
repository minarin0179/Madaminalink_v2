import type {
    ChatInputCommandInteraction,
    CommandInteractionOptionResolver,
    SlashCommandBuilder,
} from "discord.js";
import type { ExtendedClient } from "./Client";
import { Command, type RunOptions } from "./Command";

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
    danger?: boolean;
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
        this.danger = command.danger;
    }
}
