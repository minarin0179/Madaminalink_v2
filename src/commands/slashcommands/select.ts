import { ButtonInteraction, Collection, ComponentType, EmbedBuilder, GuildMember, Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import selectButton from "../../components/buttons/select";
import { buttonToRow } from "../../utils/ButtonToRow";
import selectAgregate from "../../components/buttons/selectAgregate";
import unehemeralButton from "../../components/buttons/unehemeral";
import { rename } from "./rename";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('select')
        .setDescription('キャラ選択/犯人投票を行います')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addStringOption(option => option
            .setName('投票モード')
            .setDescription('集計結果をPLに非表示にし、得票数を表示します')
            .setRequired(true)
            .addChoices(
                { name: 'キャラ選択', value: 'char' },
                { name: '犯人投票', value: 'vote' }
            )
        ).addStringOption(option => option
            .setName('選択肢')
            .setDescription('選択肢をスペース区切りで入力して下さい')
            .setRequired(true)
        ).addNumberOption(option => option
            .setName('制限時間')
            .setDescription('制限時間を分単位で入力して下さい(デフォルトは5分)')
            .setRequired(false)
            .setMaxValue(1440)
            .setMinValue(1)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {

        const choices = args.getString('選択肢', true).split(/[ 　,、]/).filter(choice => choice !== '').map(choice => {
            const roleId = choice.match(/<@&(.*)>/)
            const role = roleId ? interaction.guild?.roles.cache.get(roleId[1]) : null
            if (role) return role
            return choice
        })

        if (choices.length > 24) return reply(interaction, { content: '選択肢の数が多すぎます(最大24個)', ephemeral: true })

        const content = (args.getString('投票モード', true) === 'char') ? 'キャラクターを選択して下さい' : '投票先を選択してください'

        const message = await interaction.channel?.send({
            content,
            components: buttonToRow([
                ...selectButton.build({ choices }),
                ...selectAgregate.build()]),
        })

        const timeLimit = args.getNumber('制限時間') ?? 5

        if (!message) return reply(interaction, 'メッセージの送信に失敗しました')

        await reply(interaction, `集計を開始します\n投票は${timeLimit}分後に自動で集計されます`)

        const filter = (interaction: ButtonInteraction) => interaction.customId.startsWith('select')
        const collector = message.createMessageComponentCollector({
            filter,
            time: 1000 * 60 * timeLimit, //5分
            componentType: ComponentType.Button,
        })

        collector.on('collect', async (i: ButtonInteraction) => {
            const customId = getArgs(i)[0]
            if (customId === 'selectAgregate') {
                if (interaction.user.id === i.user.id) {
                    collector.stop()
                }
                else {
                    await reply(i, '集計は投票を開始した人のみが行えます')
                }
            }
            else if (collector.collected.filter(c => c.user.id === i.user.id).size > 1) {
                await reply(i, `${getArgs(i)[2]}に変更しました`);
            }
            else {
                await reply(i, `${getArgs(i)[2]}を選択しました`);
                if (interaction.user.id !== i.user.id) {
                    await reply(interaction, `${i.member}が選択しました`);
                }
            }
        })

        collector.on('end', async collected => {
            const result = new Collection<GuildMember, number>()//誰が何番目に入れたか
            const voter = new Collection<number, GuildMember[]>() //何番目の選択肢に誰が入れたか
            
            //誰が何番目に入れたかの集計(重複は無視)
            collected.filter(c => c.customId.startsWith('select:')).map(i => result.set(i.member as GuildMember, Number(getArgs(i)[1])))

            //何番目の選択肢に誰が入れたかの集計
            for (const [member, value] of result.entries()) {
                if (voter.has(value)) {
                    voter.get(value)?.push(member)
                } else {
                    voter.set(value, [member])
                }
            }

            if (args.getString('投票モード') === 'char') {
                let content = ''
                let warn = false;

                for (const [member, value] of result.entries()) {
                    const choice = choices[value]
                    if (voter.get(value)?.length === 1) {
                        content += `${member} → ${choice} ✅\n`
                        if (choice instanceof Role) {
                            await member.roles.add(choice)
                            await reply(interaction, `${member}に${choice}を付与しました`)
                            await rename(member, choice.name).catch(() => { })
                        } else {
                            await rename(member, choice).catch(() => { })
                        }
                    } else {
                        content += `${member} → ${choices[value]} ⚠️\n`
                        warn = true
                    }
                }

                const embed = new EmbedBuilder()
                    .addFields({ name: '集計結果', value: content || 'なし' })
                    .setColor(warn ? 0xFFCC4D : 0x77B255)

                await interaction.channel?.send({
                    embeds: [embed],
                    allowedMentions: { parse: [] }
                })

            } else if (args.getString('投票モード') === 'vote') {
                let numOfVotes = ''
                voter.sort((a, b) => b.length - a.length)
                for (const [key, value] of voter.entries()) {
                    numOfVotes += `${choices[key]} : ${value.length} 票\n`
                }
                let vote = ''
                for (const [member, value] of result.entries()) {
                    vote += `${member} → ${choices[value]}\n`
                }

                const embed = new EmbedBuilder()
                    .addFields(
                        { name: '投票数', value: numOfVotes || 'なし' },
                        { name: '投票先', value: vote || 'なし' }
                    )
                    .setColor(0x3B88C3)

                await reply(interaction, {
                    embeds: [embed],
                    allowedMentions: { parse: [] },
                    components: buttonToRow(unehemeralButton.build()),
                })
            }

            await message.delete().catch(() => { })
        })

    }
})

const getArgs = (interaction: ButtonInteraction): string[] => interaction.customId.split(/[:,]/)