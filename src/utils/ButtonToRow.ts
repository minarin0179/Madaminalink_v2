import { ActionRowBuilder, ButtonBuilder } from "discord.js";

export const buttonToRow = (buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>[] => {
    const row = new ActionRowBuilder<ButtonBuilder>();
    buttons.map(button => { row.addComponents(button) });
    return [row];
}