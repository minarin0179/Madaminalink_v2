import { Guild, SlashCommandBuilder, GuildMember, ChannelType, PermissionFlagsBits } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('setup')
        .setDescription('新規プレイ用のカテゴリーを作成します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('シナリオ名')
            .setDescription('シナリオ名')
            .setRequired(true)
        )
        .addIntegerOption(option => option
            .setName('プレイヤー数')
            .setDescription('プレイヤー数')
            .setRequired(true)
            .setMinValue(0)
        )
        .addIntegerOption(option => option
            .setName('密談チャンネル数')
            .setDescription('密談チャンネル数')
            .setRequired(true)
            .setMinValue(0)
        )
        .addRoleOption(option => option
            .setName('ロールの作成位置')
            .setDescription('指定したロールの下に新規ロール作成します')
            .setRequired(false)
        )
        .addStringOption(option => option
            .setName('個別ロールを作成しない')
            .setDescription('個別のチャンネルは作られますがロールは作成されません')
            .setRequired(false)
            .addChoices(
                { name: 'はい', value: 'true' },
                { name: 'いいえ', value: 'false' }
            )
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        const guild = interaction.guild as Guild
        const Bot = guild.members.me as GuildMember
        const everyone = guild?.roles.everyone
        const title = args.getString('シナリオ名', true)
        const playerCount = args.getInteger('プレイヤー数', true)
        const privateCount = args.getInteger('密談チャンネル数', true)

        const role = args.getRole('ロールの作成位置') ?? everyone

        const rolePosition = role?.position

        if (playerCount + privateCount + 5 >= 50) return reply(interaction, 'カテゴリーに入り切りません\nチャンネル数を減らしてください')

        await interaction.deferReply({ ephemeral: true })

        const GM = await guild.roles.create({ name: `${title} GM`, position: rolePosition })
        const PL = await guild.roles.create({ name: `${title} PL`, position: rolePosition })
        const SP = await guild.roles.create({ name: `${title} 観戦`, position: rolePosition })


        const invisible = { deny: [PermissionFlagsBits.ViewChannel] } //見えない
        const visible = { allow: [PermissionFlagsBits.ViewChannel], deny: [PermissionFlagsBits.SendMessages] } //見るだけ(書き込めない)
        const writable = { allow: [PermissionFlagsBits.ViewChannel] } //書き込める



        const defaultPerm = [
            { id: everyone.id, ...invisible },
            { id: Bot.id, ...writable },
            { id: GM.id, ...writable }
        ]

        const category = await guild.channels.create({
            name: title,
            type: ChannelType.GuildCategory,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...invisible },
                { id: SP.id, ...visible },
            ]
        })

        await guild.channels.create({
            name: '一般',
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...writable },
                { id: SP.id, ...writable },
            ]
        })

        await guild.channels.create({
            name: '共通情報',
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...visible },
                { id: SP.id, ...visible },
            ]
        })

        await guild.channels.create({
            name: '観戦',
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...invisible },
                { id: SP.id, ...writable },
            ]
        });

        for (let i = 0; i < playerCount; i++) {
            const perm = [
                ...defaultPerm,
                { id: SP.id, ...visible },
            ]

            if (!(interaction.options.getString('個別ロールを作成しない') === 'true')) {
                const PL_i = await guild.roles.create({ name: `${title} PL${i + 1}`, position: rolePosition })
                perm.push({ id: PL_i.id, ...writable })
            }

            await guild.channels.create({
                name: `pc${i + 1}`,
                type: ChannelType.GuildText,
                parent: category,
                permissionOverwrites: perm
            })
        }

        await guild.channels.create({
            name: '解説',
            type: ChannelType.GuildText,
            parent: category,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...invisible },
                { id: SP.id, ...visible },
            ]
        })

        await guild.channels.create({
            name: '全体会議',
            type: ChannelType.GuildVoice,
            parent: category,
            permissionOverwrites: [
                ...defaultPerm,
                { id: PL.id, ...writable },
                { id: SP.id, ...writable },
            ]
        });

        await Promise.all([...Array(privateCount)].map(async (_, i) => {
            await guild.channels.create({
                name: `密談場所${i + 1}`,
                type: ChannelType.GuildVoice,
                parent: category,
                permissionOverwrites: [
                    ...defaultPerm,
                    { id: PL.id, ...writable },
                    { id: SP.id, ...writable },
                ]
            })
        }))

        await reply(interaction, `「${title}」の作成が完了しました`)
    }
})