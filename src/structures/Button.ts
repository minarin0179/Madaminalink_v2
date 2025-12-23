import type { ButtonBuilder, ButtonInteraction } from "discord.js";
import type { ExtendedClient } from "./Client";
import { Component, type ComponentType, type RunOptions } from "./Component";

type ButtonBuildFunction = (options?: any) => ButtonBuilder[];

interface ButtonRunOptions extends RunOptions {
    client: ExtendedClient;
    interaction: ButtonInteraction;
    args: string[];
}

interface ButtonType extends ComponentType {
    customId: string;
    build: ButtonBuildFunction;
    execute: (options: ButtonRunOptions) => Promise<any>;
}

export class Button extends Component implements ButtonType {
    build: ButtonBuildFunction;
    execute: (options: ButtonRunOptions) => Promise<void>;

    constructor(button: ButtonType) {
        super(button);
        this.build = button.build;
        this.execute = button.execute;
    }
}
