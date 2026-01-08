import { ButtonBuilder, ButtonStyle, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";
import { ensureMembers } from "../../utils/ensureMembers";

export default new Button({
    customId: "roleRemove",
    build: ({ role }: { role: Role }) => [
        new ButtonBuilder().setCustomId(`roleRemove:${role.id}`).setLabel("解除").setStyle(ButtonStyle.Danger),
    ],
    execute: async ({ interaction, args }) => {
        const [roleId] = args;
        const role = await interaction.guild?.roles.fetch(roleId);

        if (!role) return reply(interaction, "ロールが見つかりません");
        await interaction.deferReply({ ephemeral: true });

        const guild = interaction.guild;
        if (!guild) return;
        await ensureMembers(guild);

        const { members } = role;
        if (members.size === 0) return reply(interaction, `${role}を持つメンバーがいません`);

        await Promise.all(members.map(async member => member.roles.remove(role)));
        await reply(interaction, `${[...members.values()].join(", ")}から${role}を解除しました`);
    },
});
