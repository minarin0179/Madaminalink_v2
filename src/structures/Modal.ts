import { ModalBuilder, ModalSubmitInteraction } from "discord.js";
import { ExtendedClient } from "./Client";
import { Component, ComponentType, RunOptions } from "./Component";

type ModalBuildFunction = (options: any) => ModalBuilder;

interface ModalRunOptions extends RunOptions {
    client: ExtendedClient;
    interaction: ModalSubmitInteraction;
    args: string[];
}

interface ModalType extends ComponentType {
    customId: string;
    build: ModalBuildFunction;
    execute: (options: ModalRunOptions) => Promise<any>;
}

export class Modal extends Component implements ModalType {
    build: ModalBuildFunction;
    execute: (options: ModalRunOptions) => Promise<any>;

    constructor(modal: ModalType) {
        super(modal);
        this.build = modal.build;
        this.execute = modal.execute;
    }
}
