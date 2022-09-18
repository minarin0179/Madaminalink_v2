import { ButtonBuilder, ButtonStyle, GuildMember, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleGet',
    build: ({ role }: { role: Role }) => [new ButtonBuilder()
        .setCustomId(`roleGet:${role.id}`)
        .setLabel('取得')
        .setStyle(ButtonStyle.Success)]
    ,
    execute: async ({ interaction, args }) => {


        const [roleId] = args
        const role = await interaction.guild?.roles.fetch(roleId)

        if (!role) return await reply(interaction, 'ロールが見つかりません')

        const member = interaction.member

        if (!(member instanceof GuildMember)) return;

        await member.roles.add(role)

        await reply(interaction, `${role}を付与しました`)
    }
})