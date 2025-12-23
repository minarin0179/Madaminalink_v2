import {
    InteractionContextType,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
} from "discord.js";
import profileModal from "../../components/modal/profileModal";
import { SlashCommand } from "../../structures/SlashCommand";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("botのプロフィールを変更します")
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("botのサーバープロフィールを設定します")
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName("reset")
                .setDescription("botのプロフィールをすべてリセットします")
        )
        .setContexts(InteractionContextType.Guild)
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    execute: async ({ client, interaction }) => {
        const guild = interaction.guild;

        if (!guild) return;

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "set") {
            const me = guild.members.me;
            const currentNickname = me?.nickname || "";
            const defaultName = client.user?.username;

            const modal = profileModal.build({
                defaultName,
                currentNickname,
            });

            await interaction.showModal(modal);
        } else if (subcommand === "reset") {
            // すべての設定をリセット

            await guild.members.editMe({
                avatar: null,
                banner: null,
                nick: null,
            });

            await interaction.reply({
                content: "プロフィールをすべてリセットしました",
                flags: MessageFlags.Ephemeral,
            });
        }
    },
});
