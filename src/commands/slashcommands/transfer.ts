import {
    APIInteractionDataResolvedChannel,
    CategoryChannel,
    ChannelType,
    CommandInteraction,
    discordSort,
    GuildChannel,
    GuildTextBasedChannel,
    MessageComponentInteraction,
    MessageCreateOptions,
    NewsChannel,
    SlashCommandBuilder,
    TextChannel,
    ThreadChannel,
    VoiceChannel,
} from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import transferButton from "../../components/buttons/transfer";
import transferList from "../../components/selectmenu/transferList";
import { reply } from "../../utils/Reply";
import { buttonToRow } from "../../utils/ButtonToRow";
import { arraySplit } from "../../utils/ArraySplit";

const OPTION_NAME_DESTINATION = "転送先";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription("メッセージを転送するボタンを作成します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .setName(OPTION_NAME_DESTINATION)
                .setDescription("転送先のチャンネルを選択してください")
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        const destination = args.getChannel<ChannelType.GuildText | ChannelType.GuildAnnouncement>(OPTION_NAME_DESTINATION);

        // 転送先が選択されている場合
        if (destination) {
            await sendTransferMessage(interaction, destination);
            return;
        }

        //転送先が選択されていない場合
        const channel = interaction.channel as GuildTextBasedChannel;
        const category = channel.parent?.parent ?? (channel.parent as CategoryChannel | undefined);
        const channels = (
            category?.children.cache ?? interaction.guild?.channels.cache.filter(ch => !ch.parent)
        )?.filter((channel): channel is TextChannel | NewsChannel | VoiceChannel => channel.isTextBased());

        if (!channels) return;
        const components = transferList.build([...discordSort(channels).values()]);

        if (components.length <= 5) {
            return reply(interaction, {
                content: "転送先のチャンネルを選択してください",
                components,
            });
        } else {
            const splitedComponents = arraySplit(components, 5);
            await reply(interaction, {
                content: "転送先のチャンネルを選択してください",
                components: splitedComponents[0],
            });
            await Promise.all(
                splitedComponents.slice(1).map(async component => reply(interaction, { components: component }))
            );
        }

    },
});

export const buildTransferMessage = (
    destination: GuildChannel | ThreadChannel | APIInteractionDataResolvedChannel
): MessageCreateOptions => ({
    components: buttonToRow(transferButton.build({ destination })),
});

export const sendTransferMessage = async (interaction: CommandInteraction | MessageComponentInteraction, destination: GuildTextBasedChannel) => {
    await reply(
        interaction,
        `ボタンと転送したいメッセージに同じリアクションを付けて、転送するメッセージを選択してください`
    );
    await interaction.channel?.send(buildTransferMessage(destination));
};
