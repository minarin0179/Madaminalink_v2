import { GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";

import { reply } from "../../utils/Reply";


export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('gather')
        .setDescription('メンバーを自分がいるVCに移動させます')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addRoleOption(option => option
            .setName('対象')
            .setDescription('指定しなかった場合は@everyone')
            .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })
        const executor = interaction.member
        if (!(executor instanceof GuildMember)) return
        const voiceChannel = await (await executor.fetch()).voice.channel?.fetch()
        if (!voiceChannel) return
        const targetRole = (args.getRole('対象') ?? interaction.guild?.roles.everyone) as Role
        await Promise.all(targetRole.members.map(async member => {
            if (!(member instanceof GuildMember) || !member.voice.channel) return
            await member.voice.setChannel(voiceChannel)
        }))

        await reply(interaction, `「${targetRole.name}」のメンバーを「${voiceChannel?.name}」に移動させました`)
    }
})