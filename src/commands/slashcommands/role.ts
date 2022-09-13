import { APIRole, Role, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import roleAddButton from "../../components/buttons/roleAdd";
import roleRemoveButton from "../../components/buttons/roleRemove";
import roleChangeButton from "../../components/buttons/roleChange";
import roleGetButton from "../../components/buttons/roleGet";
import roleReleaseButton from "../../components/buttons/roleRelease";
import roleList from "../../components/selectmenu/roleList";
import { buttonToRow } from "../../utils/ButtonToRow";
import { reply } from "../../utils/Reply";
import { arraySplit } from "../../utils/ArraySplit";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('role')
        .setDescription('ロールの付与や解除を行うボタンを作成します')
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addSubcommand(subcommand => subcommand
            .setName('add')
            .setDescription('対象のロールを持つメンバーにロールを付与します')
            .addRoleOption(option => option
                .setName('対象')
                .setDescription('ロールを付与する対象を選択してください')
                .setRequired(true)
            ).addRoleOption(option => option
                .setName('付与するロール')
                .setDescription('ロールを付与する対象を選択してください')
                .setRequired(true)
            )
        ).addSubcommand(subcommand => subcommand
            .setName('remove')
            .setDescription('選択したロールをすべてのメンバーから解除します')
            .addRoleOption(option => option
                .setName('解除するロール')
                .setDescription('解除するロールを選択してください')
                .setRequired(true)
            )
        ).addSubcommand(subcommand => subcommand
            .setName('change')
            .setDescription('対象のロールを別のロールに付け替えます')
            .addRoleOption(option => option
                .setName('解除するロール')
                .setDescription('解除するロールを選択してください')
                .setRequired(true)
            ).addRoleOption(option => option
                .setName('付与するロール')
                .setDescription('付与するロールを選択してください')
                .setRequired(true)
            )
        ).addSubcommand(subcommand => subcommand
            .setName('self')
            .setDescription('ロールの取得や解除を行うボタンを作成します')
            .addRoleOption(option => option
                .setName('付与するロール')
                .setDescription('ロールを選択してください')
            )
        ) as SlashCommandBuilder,
    execute: async ({ client, interaction, args }) => {
        const subCommand = args.getSubcommand()

        const target = args.getRole('対象')
        const roleAdd = args.getRole('付与するロール')
        const roleRemove = args.getRole('解除するロール')
        switch (subCommand) {
            case 'add':
                await reply(interaction, {
                    components: buttonToRow(roleAddButton.build({ target: target, role: roleAdd })),
                })
                break
            case 'remove':
                await reply(interaction, {
                    components: buttonToRow(roleRemoveButton.build({ role: roleRemove })),
                })
                break
            case 'change':
                await reply(interaction, {
                    components: buttonToRow(roleChangeButton.build({ before: roleRemove, after: roleAdd })),
                })
                break
            case 'self':
                if (!roleAdd) {
                    const roles = await interaction.guild?.roles.fetch()
                    if (!roles) return
                    for await (const rolesSplited of arraySplit([...roles.values()], 125)) {
                        await reply(interaction, {
                            components: roleList.build(rolesSplited)
                        })
                    }
                    return
                }
                await interaction.channel?.send(buildRoleRow(roleAdd))
                break
        }
    }
})

export const buildRoleRow = (role: Role | APIRole) => {
    return {
        content: `${role}`,
        components: buttonToRow([
            ...roleGetButton.build({ role }),
            ...roleReleaseButton.build({ role })
        ]),
        allowedMentions: { parse: [] },

    }
}