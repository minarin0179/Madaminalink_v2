import { ChannelType, GuildChannel, SlashCommandBuilder, CategoryChannel, TextChannel, Attachment } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { isCategory } from "../../utils/isCategory";
import { reply } from "../../utils/Reply";
import { transferAllMessages } from "../../utils/transferMessage";
import fs from 'fs'

export default new SlashCommand({
    dev: true,
    data: new SlashCommandBuilder()
        .setName('outpu')
        .setDescription('チャンネルをファイルとして出力します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option => option
            .setName('対象')
            .setDescription('出力するチャンネル/カテゴリー')
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
        ).addAttachmentOption(option => option
            .setName('入力')
            .setDescription('作成するチャンネル')
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        await interaction.deferReply({ ephemeral: true })

        const originalChannel = args.getChannel('対象', true) as TextChannel

        const messages = JSON.stringify((await originalChannel.messages.fetch()).map(message => {
            return {
                content: message.content,
                files: message.attachments.map((file: Attachment) => file.url),
                components: message.components,
                embeds: message.embeds,
            }
        }), null, " ")

        

        console.log(messages)
        fs.writeFileSync('output.json', messages)

        await reply(interaction, {
            files: ['./output.json']
        })

        await reply(interaction, `「${originalChannel.name}」のコピーが完了しました`)
    }
})
