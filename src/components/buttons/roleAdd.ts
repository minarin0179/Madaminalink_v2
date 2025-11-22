import { ButtonBuilder, ButtonStyle, GatewayRateLimitError, Role } from "discord.js";
import { Button } from "../../structures/Button";
import { generateGatewayLimitMessage } from "../../utils/generateGatewayLimitMessage";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "roleAdd",
    build: ({ target, role }: { target: Role; role: Role }) => [
        new ButtonBuilder()
            .setCustomId(`roleAdd:${target.id},${role.id}`)
            .setLabel("付与")
            .setStyle(ButtonStyle.Success),
    ],
    execute: async ({ interaction, args }) => {
        const [targetId, roleId] = args;
        const target = await interaction.guild?.roles.fetch(targetId);
        const role = await interaction.guild?.roles.fetch(roleId);

        if (!target || !role) return reply(interaction, "ロールが見つかりません");

        await interaction.deferReply({ ephemeral: true });

        try {
            await interaction.guild?.members.fetch();
        } catch (error) {
            if (!(error instanceof GatewayRateLimitError)) {
                throw error;
            }
            await reply(interaction, generateGatewayLimitMessage(error.data.retry_after));
            return;
        }

        const { members } = target;
        if (members.size === 0) return reply(interaction, `${target}を持つメンバーがいません`);

        await Promise.all(members.map(async member => member.roles.add(role)));
        await reply(interaction, `${[...members.values()].join(", ")}に${role}を付与しました`);
    },
});
