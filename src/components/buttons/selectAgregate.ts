import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";

export default new Button({
    customId: "selectAgregate",
    build: () => [new ButtonBuilder().setCustomId(`selectAgregate`).setLabel("集計").setStyle(ButtonStyle.Danger)],
    execute: async () => {
        /* Collectorで処理するのでこちらからは何もしない */
    },
});
