import { ChannelType, SlashCommandBuilder, OverwriteType } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    danger: true,
    data: new SlashCommandBuilder()
        .setName("delete")
        .setDescription("カテゴリを削除します(カテゴリに含まれるチャンネルも削除されます)")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .addChannelTypes(ChannelType.GuildCategory)
                .setName("削除するカテゴリ")
                .setDescription("削除するカテゴリ")
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName("ロールの削除")
                .setDescription("カテゴリーに付与されたロールを一緒に削除しますか？(デフォルトはいいえ)")
                .setRequired(false)
                .addChoices({ name: "はい", value: "true" }, { name: "いいえ", value: "false" })
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        await interaction.deferReply({ ephemeral: true });

        const category = args.getChannel<ChannelType.GuildCategory>("削除するカテゴリ", true);
        const deleteRoleIds = new Set<string>();
        const children = category.children.cache;

        children.map(async ch => {
            ch.permissionOverwrites.cache
                .filter(perm => perm.type == OverwriteType.Role)
                .map(perm => deleteRoleIds.add(perm.id));
        });

        await Promise.all(children.map(async ch => await ch.delete()));
        await category.delete();

        if (args.getString("ロールの削除") == "true") {
            const everyone = interaction.guild?.roles.everyone.id;
            deleteRoleIds.delete(everyone!);
            const roles = (await interaction.guild?.roles.fetch())?.filter(role => deleteRoleIds.has(role.id));
            if (roles) {
                const [deletable, undeletable] = roles.partition(role => role.editable);

                await Promise.all(deletable.map(async role => role.delete()));
                if (undeletable.size > 0) {
                    await reply(
                        interaction,
                        `マダミナリンクより上位のロールは削除できません
                        削除に失敗したロール : ${undeletable.map(role => role.toString()).join(", ")}`
                    );
                }
            }
        }

        //コマンドを入力したチャンネルが削除されている場合がある
        await reply(interaction, `「${category.name}」の削除が完了しました`).catch(() => { });
    },
});
