import { ButtonBuilder, ButtonStyle, GuildChannel, Role, User } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";
export default new Button({
    customId: 'open',
    build: ({ channel, mentionable }: { channel: GuildChannel, mentionable: Role | User }) => [new ButtonBuilder()
        .setCustomId(`open:${channel.id},${mentionable.id}`)
        .setLabel('公開')
        .setStyle(ButtonStyle.Primary)]
    ,
    execute: async ({ interaction, args }) => {
        const [channelId, mentionableId] = args;
        const channel = interaction.guild?.channels.cache.get(channelId);
        const mentionable = interaction.guild?.roles.cache.get(mentionableId) || interaction.guild?.members.cache.get(mentionableId);
        
        if (!channel) return reply(interaction, 'チャンネルが見つかりませんでした。')
        if (!mentionable) return reply(interaction, '公開相手が見つかりませんでした。')
        if (!('permissionOverwrites' in channel)) return reply(interaction, '権限を編集できません')

        await channel?.permissionOverwrites.edit(mentionable.id, { ViewChannel: true })
        await interaction.message.delete()
        await reply(interaction, 'チャンネルを公開しました');
    },
})