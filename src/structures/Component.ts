import { ComponentBuilder, MessageComponentInteraction, ModalBuilder, ModalSubmitInteraction } from "discord.js"
import { ExtendedClient } from "./Client"

type ComponentBuildFunction = (options?: any) => ComponentBuilder[] | ModalBuilder

export interface RunOptions {
    client: ExtendedClient,
    interaction: MessageComponentInteraction | ModalSubmitInteraction,
    args: string[]
}

export interface ComponentType {
    customId: string
    build: ComponentBuildFunction
    execute: (options: any) => Promise<void>
}

export class Component implements ComponentType {
    customId: string
    build: ComponentBuildFunction
    execute: (options: any) => Promise<void>;

    constructor(component: ComponentType) {
        this.customId = component.customId
        this.build = component.build
        this.execute = component.execute
    }
}