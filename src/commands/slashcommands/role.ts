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
        .setName("role")
        .setDescription("ロールの付与や解除を行うボタンを作成します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addSubcommand(subcommand =>
            subcommand
                .setName("add")
                .setDescription("対象のロールを持つメンバーにロールを付与します")
                .addRoleOption(option =>
                    option.setName("対象").setDescription("ロールを付与する対象を選択してください").setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName("付与するロール")
                        .setDescription("ロールを付与する対象を選択してください")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("ボタンを他の人からも見えるようにする")
                        .setDescription("ボタンが他の人からも見えるようになり、押せるようになります")
                        .setRequired(false)
                        .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("remove")
                .setDescription("選択したロールをすべてのメンバーから解除します")
                .addRoleOption(option =>
                    option
                        .setName("解除するロール")
                        .setDescription("解除するロールを選択してください")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("ボタンを他の人からも見えるようにする")
                        .setDescription("ボタンが他の人からも見えるようになり、押せるようになります")
                        .setRequired(false)
                        .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("change")
                .setDescription("対象のロールを別のロールに付け替えます")
                .addRoleOption(option =>
                    option
                        .setName("解除するロール")
                        .setDescription("解除するロールを選択してください")
                        .setRequired(true)
                )
                .addRoleOption(option =>
                    option
                        .setName("付与するロール")
                        .setDescription("付与するロールを選択してください")
                        .setRequired(true)
                )
                .addStringOption(option =>
                    option
                        .setName("ボタンを他の人からも見えるようにする")
                        .setDescription("ボタンが他の人からも見えるようになり、押せるようになります(非推奨)")
                        .setRequired(false)
                        .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("self")
                .setDescription("ロールの取得や解除を行うボタンを作成します")
                .addRoleOption(option => option.setName("付与するロール").setDescription("ロールを選択してください"))
        ) as SlashCommandBuilder,
    execute: async ({ interaction, args }) => {
        const subCommand = args.getSubcommand();

        const target = args.getRole("対象");
        const roleAdd = args.getRole("付与するロール");
        const roleRemove = args.getRole("解除するロール");
        const ephemeral = args.getString("ボタンを他の人からも見えるようにする") === "true" ? false : true;
        const allowedMentions = { parse: [] };

        switch (subCommand) {
            case "add":
                await reply(interaction, {
                    content: `${target}に${roleAdd}を付与します`,
                    components: buttonToRow(roleAddButton.build({ target: target, role: roleAdd })),
                    ephemeral,
                    allowedMentions,
                });
                break;
            case "remove":
                await reply(interaction, {
                    content: `${roleRemove}をすべてのメンバーから解除します`,
                    components: buttonToRow(roleRemoveButton.build({ role: roleRemove })),
                    ephemeral,
                    allowedMentions,
                });
                break;
            case "change":
                if (roleAdd == roleRemove) return reply(interaction, "変更前と変更後のロールが同じです");
                await reply(interaction, {
                    content: `${roleRemove}を${roleAdd}に付け替えます`,
                    components: buttonToRow(roleChangeButton.build({ before: roleRemove, after: roleAdd })),
                    ephemeral,
                    allowedMentions,
                });
                break;
            case "self":
                if (!roleAdd) {
                    const roleManager = interaction.guild?.roles;
                    const roles = (await roleManager?.fetch())?.filter(
                        role => !role.managed && role != roleManager?.everyone
                    );
                    if (!roles || roles?.size == 0) return reply(interaction, "ロールが見つかりませんでした");

                    roles.sort((roleA, roleB) => roleB.rawPosition - roleA.rawPosition);
                    for await (const [index, rolesSplited] of arraySplit([...roles.values()], 125).entries()) {
                        await reply(interaction, {
                            components: roleList.build(rolesSplited, index * 5 + 1),
                        });
                    }
                    break;
                }
                await interaction.channel?.send(buildRoleRow(roleAdd));
                await reply(interaction, "ボタンを作成しました");
                break;
        }
    },
});

export const buildRoleRow = (role: Role | APIRole) => {
    return {
        content: `${role}`,
        components: buttonToRow([...roleGetButton.build({ role }), ...roleReleaseButton.build({ role })]),
        allowedMentions: { parse: [] },
    };
};
