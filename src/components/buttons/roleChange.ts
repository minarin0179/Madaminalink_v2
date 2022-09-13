import { ButtonBuilder, ButtonStyle } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleChange',
    build: ({ before, after }) => new ButtonBuilder()
        .setCustomId(`roleChange:${before.id},${after.id}`)
        .setLabel(`「@${before.name}」を「@${after.name}」に付け替え`)
        .setStyle(ButtonStyle.Danger)
    ,
    execute: async ({ interaction, args }) => {
        const [beforeId, afterId] = args
        const before = await interaction.guild?.roles.fetch(beforeId)
        const after = await interaction.guild?.roles.fetch(afterId)

        if (!before || !after) {
            await interaction.reply({
                content: 'ロールが見つかりません',
                ephemeral: true
            })
            return
        }
        await interaction.reply({ content: 'ロールを変更しています', ephemeral: true })

        await interaction.guild?.members.fetch()

        const { members } = before
        await Promise.all(members.map(async member => {
            await member.roles.add(after)
            await member.roles.remove(before)
        }))

        await reply(interaction, `${[...members.values()].join(',')}の${before}を${after}に変更しました`)
    },
})