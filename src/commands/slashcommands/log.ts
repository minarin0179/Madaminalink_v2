import { ChannelType, SlashCommandBuilder, CategoryChannel, OverwriteType } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("log")
        .setDescription("プレイ後のチャンネルを非表示にします")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .addChannelTypes(ChannelType.GuildCategory)
                .setName("非表示にするカテゴリ")
                .setDescription("非表示にするカテゴリ")
                .setRequired(true)
        )
        .addRoleOption(option =>
            option.setName("閲覧用ロール").setDescription("閲覧用ロールにのみ見えるようにします").setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {},
});
