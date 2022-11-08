import { ButtonBuilder, ButtonStyle, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleChange',
    build: ({ before, after }: { before: Role, after: Role }) => [new ButtonBuilder()
        .setCustomId(`roleChange:${before.id},${after.id}`)
        .setLabel(`「@${before.name}」を「@${after.name}」に付け替え`)
        .setStyle(ButtonStyle.Primary)]
    ,
    execute: async ({ interaction, args }) => {
        const [beforeId, afterId] = args
        const before = await interaction.guild?.roles.fetch(beforeId)
        const after = await interaction.guild?.roles.fetch(afterId)

        if (!before || !after) return reply(interaction, 'ロールが見つかりません')
        await interaction.deferReply({ ephemeral: true })

        await interaction.guild?.members.fetch()

        const { members } = before
        if (members.size === 0) return reply(interaction, `${before}を持つメンバーがいません`)

        await Promise.all(members.map(async member => {
            await member.roles.add(after)
            await member.roles.remove(before)
        }))

        await reply(interaction, `${[...members.values()].join(', ')}の${before}を${after}に変更しました`)
    },
})