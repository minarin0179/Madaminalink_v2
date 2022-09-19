import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, SelectMenuBuilder, SelectMenuInteraction } from "discord.js"
import { ExtendedClient } from "./Client"
import { Component, ComponentType, RunOptions } from "./Component"

type SelectMenuBuildFunction = (...options: any) => ActionRowBuilder<SelectMenuBuilder>[]

interface SelectMenuRunOptions extends RunOptions {
    client: ExtendedClient,
    interaction: SelectMenuInteraction,
    args: string[]
}

interface SelectMenuType extends ComponentType {
    customId: string
    build: SelectMenuBuildFunction
    execute: (options: SelectMenuRunOptions) => Promise<any>
}

export class SelectMenu extends Component implements SelectMenuType {
    build: SelectMenuBuildFunction
    execute: (options: SelectMenuRunOptions) => Promise<any>;

    constructor(selectMenu: SelectMenuType) {
        super(selectMenu)
        this.build = selectMenu.build
        this.execute = selectMenu.execute
    }
}