import type {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuInteraction,
} from "discord.js";
import type { ExtendedClient } from "./Client";
import { Component, type ComponentType, type RunOptions } from "./Component";

type SelectMenuBuildFunction = (
    ...options: any
) => ActionRowBuilder<StringSelectMenuBuilder>[];

interface SelectMenuRunOptions extends RunOptions {
    client: ExtendedClient;
    interaction: StringSelectMenuInteraction;
    args: string[];
}

interface SelectMenuType extends ComponentType {
    customId: string;
    build: SelectMenuBuildFunction;
    execute: (options: SelectMenuRunOptions) => Promise<any>;
}

export class SelectMenu extends Component implements SelectMenuType {
    build: SelectMenuBuildFunction;
    execute: (options: SelectMenuRunOptions) => Promise<any>;

    constructor(selectMenu: SelectMenuType) {
        super(selectMenu);
        this.build = selectMenu.build;
        this.execute = selectMenu.execute;
    }
}
