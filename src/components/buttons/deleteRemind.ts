import { ButtonBuilder, ButtonStyle, GuildChannel, Role, User } from "discord.js";
import { ObjectId } from "mongodb";
import { agenda } from "../../agenda";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";
export default new Button({
    customId: 'deleteRemind',
    build: ({ objectId }: { objectId: ObjectId }) => [new ButtonBuilder()
        .setCustomId(`deleteRemind:${objectId}`)
        .setLabel('削除')
        .setStyle(ButtonStyle.Danger)]
    ,
    execute: async ({ interaction, args }) => {
        const [objectId] = args;
        agenda.cancel({ _id: new ObjectId(objectId) })
            .then(() => reply(interaction, 'リマインドを削除しました'))
            .catch(() => reply(interaction, 'リマインドの削除に失敗しました'))
    },
})