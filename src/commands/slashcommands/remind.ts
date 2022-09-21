import { Channel, ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import { agenda } from "../../agenda";
import { buttonToRow } from "../../utils/ButtonToRow";
import deleteRemindButton from "../../components/buttons/deleteRemind";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('remind')
        .setDescription('リマインダーの登録や削除を行います')
        .setDMPermission(true)
        .setDefaultMemberPermissions(0)
        .addSubcommand(subcommand => subcommand
            .setName('set')
            .setDescription('新たなリマインダーを登録します')
            .addIntegerOption(option => option
                .setName('月')
                .setDescription('月を入力してください')
                .setMinValue(1)
                .setMaxValue(12)
                .setRequired(true)
            ).addIntegerOption(option => option
                .setName('日')
                .setDescription('日付を入力してください')
                .setMinValue(1)
                .setMaxValue(31)
                .setRequired(true)
            ).addIntegerOption(option => option
                .setName('時')
                .setDescription('時を入力してください')
                .setMinValue(0)
                .setMaxValue(23)
                .setRequired(true)
            ).addIntegerOption(option => option
                .setName('分')
                .setDescription('分を入力してください')
                .setMinValue(0)
                .setMaxValue(59)
                .setRequired(true)
            ).addStringOption(option => option
                .setName('本文')
                .setDescription('送信するメッセージを入力して下さい')
                .setRequired(true)
            ).addChannelOption(option => option
                .setName('送信先')
                .setDescription('送信先のチャンネルを選択してください(指定しなかった場合は入力したチャンネルに送信されます)')
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(false)
            )
        ).addSubcommand(subcommand => subcommand
            .setName('list')
            .setDescription('登録されているリマインダーを確認します')
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        if (args.getSubcommand() === 'set') {

            let year = new Date().getFullYear();
            const month = args.getInteger('月', true)
            const day = args.getInteger('日', true)
            const hour = args.getInteger('時', true)
            const minute = args.getInteger('分', true)
            const content = args.getString('本文', true)
            const destination = args.getChannel('送信先') ?? interaction.channel

            process.env.TZ = "Asia/Tokyo";

            const date = new Date(year, month - 1, day, hour, minute)
            const now = new Date()
            const lim = new Date()

            lim.setMonth(lim.getMonth() + 3)

            if (!destination) return reply(interaction, '送信先が見つかりませんでした')

            if (date.getTime() < now.getTime()) {
                date.setFullYear(++year) //過去の日付だったら１年後
            }

            else if (date.getTime() > lim.getTime()) {
                return reply(interaction, '日時の入力が正しくありません\n過去の日付や3ヶ月以上先の日付は設定できません')
            }

            const channelId = destination.id
            const authorId = interaction.user.id

            const job = await agenda.schedule(date, 'send remind', { channelId, authorId, content })

            await reply(interaction, {
                content: 'リマインダーを設定しました',
                embeds: [buildEmbed(content, date, channelId)],
                components: buttonToRow(deleteRemindButton.build({ objectId: job.attrs._id?.toHexString() }))
            })

        } else if (args.getSubcommand() === 'list') {

            await reply(interaction, 'リマインダーの一覧を表示します')
            const jobs = await agenda.jobs({ name: 'send remind', 'data.authorId': interaction.user.id })
            if (jobs.length == 0) return reply(interaction, '登録されているリマインダーはありません')

            jobs.map(job => {
                if (!job.attrs.data) return
                const date = new Date(job.attrs.nextRunAt ?? '')
                const { content, channelId } = job.attrs.data

                return reply(interaction, {
                    embeds: [buildEmbed(content, date, channelId)],
                    components: buttonToRow(deleteRemindButton.build({ objectId: job.attrs._id?.toHexString() }))
                })
            })
        }
    }
})

const buildEmbed = (content: string, date: Date, channelId: string) =>
    new EmbedBuilder().addFields(
        { name: '本文', value: content },
        { name: '日時', value: date.toLocaleString(), inline: true },
        { name: '送信先', value: `<#${channelId}>`, inline: true }
    )