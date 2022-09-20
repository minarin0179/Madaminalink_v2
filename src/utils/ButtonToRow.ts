import { ActionRowBuilder, ButtonBuilder } from "discord.js";
import { arraySplit } from "./ArraySplit";

export const buttonToRow = (buttons: ButtonBuilder[]): ActionRowBuilder<ButtonBuilder>[] => {
    return arraySplit(buttons, 5).map(buttons => {
        const row = new ActionRowBuilder<ButtonBuilder>();
        buttons.map(button => { row.addComponents(button) });
        return row;
    })

}