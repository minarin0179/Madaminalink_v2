import {
    APIInteractionDataResolvedChannel,
    CategoryChannel,
    ChannelType,
    discordSort,
    GuildChannel,
    GuildTextBasedChannel,
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

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("transfer")
        .setDescription("メッセージを転送するボタンを作成します")
        .setDMPermission(false)
        .setDefaultMemberPermissions(0)
        .addChannelOption(option =>
            option
                .setName("転送先")
                .setDescription("転送先のチャンネルを選択してください")
                .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
                .setRequired(false)
        ) as SlashCommandBuilder,

    execute: async ({ interaction, args }) => {
        const destination = args.getChannel("転送先");

        if (!destination) {
            const channel = interaction.channel as GuildTextBasedChannel;
            const category = channel.parent?.parent ?? (channel.parent as CategoryChannel | undefined);
            const channels = (
                category?.children.cache ?? interaction.guild?.channels.cache.filter(ch => !ch.parent)
            )?.filter((channel): channel is TextChannel | NewsChannel | VoiceChannel => channel.isTextBased());

            if (!channels) return;

            await reply(interaction, {
                content: "転送先のチャンネルを選択してください",
                components: transferList.build([...discordSort(channels).values()]),
            });
        } else {
            await reply(interaction, `ボタンと転送したいメッセージに同じリアクションを付けて、転送するメッセージを選択してください`);

            await interaction.channel?.send(buildTransferMessage(destination));
        }
    },
});

export const buildTransferMessage = (
    destination: GuildChannel | ThreadChannel | APIInteractionDataResolvedChannel
): MessageCreateOptions => ({
    components: buttonToRow(transferButton.build({ destination })),
});
