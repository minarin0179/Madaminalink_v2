import type {
    CommandInteractionOptionResolver,
    ContextMenuCommandBuilder,
    ContextMenuCommandInteraction,
} from "discord.js";
import type { ExtendedClient } from "./Client";
import { Command, type RunOptions } from "./Command";

interface ContextMenuRunOptions extends RunOptions {
    client: ExtendedClient;
    interaction: ContextMenuCommandInteraction;
    args: CommandInteractionOptionResolver;
}

type RunFunction = (options: ContextMenuRunOptions) => Promise<any>;

interface ContextMenuType {
    data: ContextMenuCommandBuilder;
    execute: RunFunction;
    dev?: boolean | undefined;
    danger?: boolean;
}

export class ContextMenu extends Command implements ContextMenuType {
    data: ContextMenuCommandBuilder;
    execute: RunFunction;

    constructor(command: ContextMenuType) {
        super(command);
        this.data = command.data;
        this.execute = command.execute;
        this.dev = command.dev;
        this.danger = command.danger;
    }
}
