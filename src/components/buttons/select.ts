import { ButtonBuilder, ButtonStyle, Guild, Role } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: "select",
    build: ({ choices }: { choices: (string | Role)[]; guild: Guild }) =>
        choices.map((choice, index) => {
            if (choice instanceof Role)
                return new ButtonBuilder()
                    .setCustomId(`select:${index},${choice.name},${choice.id}`)
                    .setLabel(choice.name)
                    .setStyle(ButtonStyle.Primary);
            else {
                return new ButtonBuilder()
                    .setCustomId(`select:${index},${choice}`)
                    .setLabel(choice)
                    .setStyle(ButtonStyle.Primary);
            }
        }),
    execute: async () => {
        /* Collectorで処理するのでこちらからは何もしない */
    },
});
