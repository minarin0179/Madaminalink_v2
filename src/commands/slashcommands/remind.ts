import { ChannelType, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { agenda } from "../../agenda";
import { client } from "../../bot";
import deleteRemindButton from "../../components/buttons/deleteRemind";
import { SlashCommand } from "../../structures/SlashCommand";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";

const today = new Date();
const month = today.getMonth() + 1;
const day = today.getDate();

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("remind")
        .setDescription("リマインダーの登録や削除を行います")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("新たなリマインダーを登録します")
                .addIntegerOption(option =>
                    option
                        .setName("月")
                        .setDescription(
                            `月を入力してください (今日の日付:${month}月${day}日)`
                        )
                        .setMinValue(1)
                        .setMaxValue(12)
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("日")
                        .setDescription(
                            `日付を入力してください (今日の日付:${month}月${day}日)`
                        )
                        .setMinValue(1)
                        .setMaxValue(31)
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("時")
                        .setDescription("時を入力してください")
                        .setMinValue(0)
                        .setMaxValue(23)
                        .setRequired(true)
                )
                .addIntegerOption(option =>
                    option
                        .setName("分")
                        .setDescription("分を入力してください")
                        .setMinValue(0)
                        .setMaxValue(59)
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("本文")
                        .setDescription("送信するメッセージを入力して下さい")
                        .setRequired(true)
                )
                .addChannelOption(option =>
                    option
                        .setName("送信先")
                        .setDescription(
                            "送信先のチャンネルを選択してください(指定しなかった場合は入力したチャンネルに送信されます)"
                        )
                        .addChannelTypes(
                            ChannelType.GuildText,
                            ChannelType.GuildAnnouncement
                        )
                        .setRequired(false)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("list")
                .setDescription("登録されているリマインダーを確認します")
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        if (args.getSubcommand() === "set") {
            let year = new Date().getFullYear();
            const month = args.getInteger("月", true);
            const day = args.getInteger("日", true);
            const hour = args.getInteger("時", true);
            const minute = args.getInteger("分", true);
            // eslint-disable-next-line no-irregular-whitespace
            const content = args
                .getString("本文", true)
                .replace(/ {2}|　{2}|\\n/g, "\n");
            const destination =
                args.getChannel("送信先") ?? interaction.channel;

            const date = new Date(year, month - 1, day, hour, minute);
            const now = new Date();
            const lim = new Date();

            lim.setMonth(lim.getMonth() + 3);

            if (!destination)
                return reply(interaction, "送信先が見つかりませんでした");

            if (date.getTime() < now.getTime()) {
                date.setFullYear(++year); //過去の日付だったら１年後
            }
            if (date.getTime() > lim.getTime()) {
                return reply(
                    interaction,
                    "日時の入力が正しくありません\n過去の日付や3ヶ月以上先の日付は設定できません"
                );
            }

            const channelId = destination.id;
            const authorId = interaction.user.id;

            const job = await agenda.schedule(date, "send remind", {
                channelId,
                authorId,
                content,
            });

            await reply(interaction, {
                content: "リマインダーを設定しました",
                embeds: [buildEmbed(content, date, channelId)],
                components: buttonToRow(
                    deleteRemindButton.build({
                        objectId: job.attrs._id?.toHexString(),
                    })
                ),
            });
        } else if (args.getSubcommand() === "list") {
            await reply(interaction, "リマインダーの一覧を表示します");
            const jobs = await agenda.jobs({
                name: "send remind",
                "data.authorId": interaction.user.id,
            });
            if (jobs.length == 0)
                return reply(
                    interaction,
                    "登録されているリマインダーはありません"
                );

            jobs.map(job => {
                if (!job.attrs.data) return;
                const date = new Date(job.attrs.nextRunAt ?? "");
                const { content, channelId } = job.attrs.data;

                return reply(interaction, {
                    embeds: [buildEmbed(content, date, channelId)],
                    components: buttonToRow(
                        deleteRemindButton.build({
                            objectId: job.attrs._id?.toHexString(),
                        })
                    ),
                });
            });
        }
    },
});

const buildEmbed = (content: string, date: Date, channelId: string) =>
    new EmbedBuilder()
        .setTitle("本文")
        .setDescription(content)
        .addFields(
            { name: "日時", value: date.toLocaleString(), inline: true },
            { name: "送信先", value: `<#${channelId}>`, inline: true }
        );

agenda.define("send remind", async (job: any) => {
    const { channelId, content } = job.attrs.data;
    await job.remove();
    await sendMessage(channelId, content);
});

const sendMessage = async (channelID: string, content: string) => {
    // try to get guild from all the shards
    const req = await client.shard?.broadcastEval(
        (c, { channelID, content }) => {
            const channel = c.channels.cache.get(channelID);
            if (channel?.isTextBased()) {
                channel.send(content);
            }
            return channel;
        },
        { context: { channelID, content } }
    );

    return req?.find(res => !!res) || null;
};
