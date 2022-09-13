import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleAdd',
    build: ({ target, role }) => [new ButtonBuilder()
        .setCustomId(`roleAdd:${target.id},${role.id}`)
        .setLabel(`「@${target.name}」に「@${role.name}」を付与`)
        .setStyle(ButtonStyle.Success)]
    ,
    execute: async ({ interaction, args }) => {


        const [targetId, roleId] = args
        const target = await interaction.guild?.roles.fetch(targetId)
        const role = await interaction.guild?.roles.fetch(roleId)

        if (!target || !role) {
            await reply(interaction, 'ロールが見つかりません')
            return
        }

        await reply(interaction, 'ロールを付与しています')

        await interaction.guild?.members.fetch()

        const { members } = target
        await Promise.all(members.map(async member => { await member.roles.add(role) }))

        await reply(interaction, `${[...members.values()].join(', ')}に${role}を付与しました`)
    }
})