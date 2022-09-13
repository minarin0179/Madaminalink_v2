import { ActionRowBuilder, SelectMenuBuilder, Role } from "discord.js";
import { buildRoleRow } from "../../commands/slashcommands/role";
import { SelectMenu } from "../../structures/SelectMenu";
import { arraySplit } from "../../utils/ArraySplit";
import { reply } from "../../utils/Reply";

export default new SelectMenu({
    customId: 'roleList',
    build: (roles: Role[]) => arraySplit(roles, 25).map((roles, index) =>
        new ActionRowBuilder<SelectMenuBuilder>()
            .addComponents(new SelectMenuBuilder()
                .setCustomId(`roleList`)
                .setPlaceholder(`ロールを選択 (ページ${index + 1})`)
                .setMinValues(1)
                .setMaxValues(roles.length)
                .addOptions(
                    roles.map(role => ({
                        label: role.name,
                        value: role.id
                    }))
                )
            )
    ),
    execute: async ({ interaction }) => {
        await interaction.deferReply({ ephemeral: true })

        for await (const id of interaction.values) {
            const role = interaction.guild?.roles.cache.get(id)
            if (!role) continue
            await interaction.channel?.send(buildRoleRow(role))
        }

        await reply(interaction, 'ボタンを作成しました')
    },
})