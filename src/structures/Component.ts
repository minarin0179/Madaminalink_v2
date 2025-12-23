import type {
    ComponentBuilder,
    MessageComponentInteraction,
    ModalBuilder,
    ModalSubmitInteraction,
} from "discord.js";
import type { ExtendedClient } from "./Client";

type ComponentBuildFunction = (
    options?: any
) => ComponentBuilder[] | ModalBuilder;

export interface RunOptions {
    client: ExtendedClient;
    interaction: MessageComponentInteraction | ModalSubmitInteraction;
    args: string[];
}

export interface ComponentType {
    customId: string;
    build: ComponentBuildFunction;
    execute: (options: any) => Promise<any>;
}

export class Component implements ComponentType {
    customId: string;
    build: ComponentBuildFunction;
    execute: (options: any) => Promise<any>;

    constructor(component: ComponentType) {
        this.customId = component.customId;
        this.build = component.build;
        this.execute = component.execute;
    }
}
