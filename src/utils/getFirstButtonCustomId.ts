import { ActionRow, ButtonComponent, Message } from "discord.js";

export const getFirstButtonCustomId = (message: Message) => {
    const firstComponent = message.components[0];
    if (!(firstComponent instanceof ActionRow)) return null;
    if (!(firstComponent.components[0] instanceof ButtonComponent)) return null;
    return firstComponent.components[0].customId;
};
