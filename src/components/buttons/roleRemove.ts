import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleRemove',
    build: ({ role }) => [new ButtonBuilder()
        .setCustomId(`roleRemove:${role.id}`)
        .setLabel(`「@${role.name}」を解除`)
        .setStyle(ButtonStyle.Danger)]
    ,
    execute: async ({ interaction, args }) => {
        const [roleId] = args
        const role = await interaction.guild?.roles.fetch(roleId)

        if (!role) {
            await reply(interaction, 'ロールが見つかりません')
            return
        }

        await reply(interaction, 'ロールを解除しています')

        await interaction.guild?.members.fetch()

        const { members } = role
        await Promise.all(members.map(async member => await member.roles.remove(role)))

        await reply(interaction, `${[...members.values()].join(', ')}から${role}を解除しました`)
    },
})