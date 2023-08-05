import { ButtonBuilder, ButtonStyle, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "roleAdd",
    build: ({ target, role }: { target: Role; role: Role }) => [
        new ButtonBuilder()
            .setCustomId(`roleAdd:${target.id},${role.id}`)
            .setLabel(`「@${target.name}」に「@${role.name}」を付与`)
            .setStyle(ButtonStyle.Success),
    ],
    execute: async ({ interaction, args }) => {
        const [targetId, roleId] = args;
        const target = await interaction.guild?.roles.fetch(targetId);
        const role = await interaction.guild?.roles.fetch(roleId);

        if (!target || !role) return reply(interaction, "ロールが見つかりません");

        await interaction.deferReply({ ephemeral: true });

        await interaction.guild?.members.fetch();

        const { members } = target;
        if (members.size === 0) return reply(interaction, `${target}を持つメンバーがいません`);

        await Promise.all(members.map(async member => await member.roles.add(role)));
        await reply(interaction, `${[...members.values()].join(", ")}に${role}を付与しました`);
    },
});
