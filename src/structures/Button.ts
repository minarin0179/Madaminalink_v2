import { ButtonBuilder, ButtonInteraction } from "discord.js"
import { ExtendedClient } from "../Client"

type ButtonBuildFunction = (options: any) => ButtonBuilder

interface ButtonRunOptions {
    client: ExtendedClient,
    interaction: ButtonInteraction,
    args: string[]
}

interface ButtonType {
    customId: string
    build: ButtonBuildFunction
    execute: (options: ButtonRunOptions) => Promise<void>
}

export class Button implements ButtonType {
    customId: string
    build: ButtonBuildFunction
    execute: (options: ButtonRunOptions) => Promise<void>;

    constructor(button: ButtonType) {
        this.customId = button.customId
        this.build = button.build
        this.execute = button.execute
    }
}