import {
    ButtonBuilder,
    ButtonStyle,
    GatewayRateLimitError,
    type Role,
} from "discord.js";
import { Button } from "../../structures/Button";
import { generateGatewayLimitMessage } from "../../utils/generateGatewayLimitMessage";
import { isEditable } from "../../utils/isEditable";
import { reply } from "../../utils/Reply";

export default new Button({
    customId: "roleChange",
    build: ({ before, after }: { before: Role; after: Role }) => [
        new ButtonBuilder()
            .setCustomId(`roleChange:${before.id},${after.id}`)
            .setLabel("付け替え")
            .setStyle(ButtonStyle.Primary),
    ],
    execute: async ({ interaction, args }) => {
        const [beforeId, afterId] = args;
        const before = await interaction.guild?.roles.fetch(beforeId);
        const after = await interaction.guild?.roles.fetch(afterId);

        if (!before || !after)
            return reply(interaction, "ロールが見つかりません");
        if (!isEditable(before) || !isEditable(after))
            return reply(
                interaction,
                "マダミナリンクより上位のロールは編集できません"
            );
        await interaction.deferReply({ ephemeral: true });

        try {
            await interaction.guild?.members.fetch();
        } catch (error) {
            if (!(error instanceof GatewayRateLimitError)) {
                throw error;
            }
            await reply(
                interaction,
                generateGatewayLimitMessage(error.data.retry_after)
            );
            return;
        }

        const { members } = before;
        if (members.size === 0)
            return reply(interaction, `${before}を持つメンバーがいません`);

        await Promise.all(
            members.map(async member =>
                member.roles.set(
                    member.roles.cache
                        .set(after.id, after)
                        .filter(role => role.id !== before.id)
                )
            )
        );

        await reply(
            interaction,
            `${[...members.values()].join(", ")}の${before}を${after}に変更しました`
        );
    },
});
