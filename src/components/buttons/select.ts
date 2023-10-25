import { ButtonBuilder, ButtonStyle, Guild, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { LimitLength } from "../../utils/LimitLength";

export default new Button({
    customId: "select",
    build: ({ choices }: { choices: (string | Role)[]; guild: Guild }) =>
        choices.map((choice, index) => {
            const isRole = choice instanceof Role;
            const label = LimitLength(isRole ? choice.name : choice, 16);

            return new ButtonBuilder()
                .setCustomId(`select:${index},${label},${isRole ? choice.id : ""}`)
                .setLabel(label)
                .setStyle(ButtonStyle.Primary);
        }),
    execute: async () => {
        /* Collectorで処理するのでこちらからは何もしない */
    },
});
