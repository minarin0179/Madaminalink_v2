import { ButtonBuilder, ButtonStyle, GuildMember, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { isEditable } from "../../utils/isEditable";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleRelease',
    build: ({ role }: { role: Role }) => [new ButtonBuilder()
        .setCustomId(`roleRelease:${role.id}`)
        .setLabel('解除')
        .setStyle(ButtonStyle.Danger)]
    ,
    execute: async ({ interaction, args }) => {


        const [roleId] = args
        const role = await interaction.guild?.roles.fetch(roleId)

        if (!role) return reply(interaction, 'ロールが見つかりません')
        if (!isEditable(role)) return reply(interaction, 'マダミナリンクより上位のロールは解除できません')

        const member = interaction.member

        if (!(member instanceof GuildMember)) return;

        await member.roles.remove(role)

        await reply(interaction, `${role}を解除しました`)
    }
})