import { ButtonBuilder, ButtonStyle, GuildMember } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: 'roleRelease',
    build: ({ role }) => [new ButtonBuilder()
        .setCustomId(`roleRelease:${role.id}`)
        .setLabel('解除')
        .setStyle(ButtonStyle.Danger)]
    ,
    execute: async ({ interaction, args }) => {


        const [roleId] = args
        const role = await interaction.guild?.roles.fetch(roleId)

        if (!role) {
            await interaction.reply({
                content: 'ロールが見つかりません',
                ephemeral: true
            })
            return
        }

        const member = interaction.member

        if (!(member instanceof GuildMember)) return;

        await member.roles.remove(role)

        await reply(interaction, `${role}を解除しました`)
    }
})