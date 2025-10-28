import { ChatInputCommandInteraction, Guild, SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";
import profileModal from "../../components/modal/profileModal";

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("マダミナリンクのプロフィールを変更します")
        .addSubcommand(subcommand =>
            subcommand
                .setName("set")
                .setDescription("プロフィールを設定します")
                .addAttachmentOption(option =>
                    option.setName("avatar").setDescription("アバター画像ファイル").setRequired(false)
                )
                .addAttachmentOption(option =>
                    option.setName("banner").setDescription("バナー画像ファイル").setRequired(false)
                )
                .addStringOption(option => option.setName("bio").setDescription("自己紹介文").setRequired(false))
                .addStringOption(option => option.setName("nickname").setDescription("ニックネーム").setRequired(false))
        )
        .addSubcommand(subcommand => subcommand.setName("reset").setDescription("プロフィールをすべてリセットします")),
    execute: async ({ client, interaction }) => {
        const guild = interaction.guild;

        if (!guild) {
            await reply(interaction, "このコマンドはサーバー内でのみ使用できます。");
            return;
        }

        const subcommand = interaction.options.getSubcommand();

        if (subcommand === "set") {
            await handleSetProfile(client, interaction, guild);
        } else if (subcommand === "reset") {
            // すべての設定をリセット
            try {
                await interaction.deferReply();

                await guild.members.editMe({
                    avatar: null,
                    banner: null,
                    bio: null,
                    nick: null,
                });

                await interaction.editReply("プロフィールをすべてリセットしました！");
            } catch (error) {
                await interaction.editReply("プロフィールのリセットに失敗しました。");
            }
        }
    },
});

async function handleSetProfile(client: any, interaction: ChatInputCommandInteraction, guild: Guild) {
    const avatarAttachment = interaction.options.getAttachment("avatar");
    const bannerAttachment = interaction.options.getAttachment("banner");
    const bio = interaction.options.getString("bio");
    const nickname = interaction.options.getString("nickname");

    // 全てのオプションがnullの場合はモーダルを表示
    if (!avatarAttachment && !bannerAttachment && !bio && !nickname) {
        const me = guild.members.me;
        const currentAvatar = client.user?.avatarURL();
        const currentBanner = client.user?.bannerURL();
        const currentBio = me?.bio || "";
        const currentNickname = me?.nickname || "";

        const modal = profileModal.build({
            type: "set",
            currentAvatar,
            currentBanner,
            currentBio,
            currentNickname,
        });

        await interaction.showModal(modal);
        return;
    }

    // オプションで指定された値でプロフィールを更新
    try {
        await interaction.deferReply();

        const updateData: {
            avatar?: string;
            banner?: string;
            bio?: string;
            nick?: string;
        } = {};

        const changes: string[] = [];

        // アバター画像の処理
        if (avatarAttachment) {
            if (!avatarAttachment.contentType?.startsWith("image/")) {
                await interaction.editReply("アバター画像ファイルの形式が正しくありません。");
                return;
            }

            const maxSize = 8 * 1024 * 1024; // 8MB
            if (avatarAttachment.size > maxSize) {
                await interaction.editReply(
                    "アバター画像のファイルサイズが大きすぎます。8MB以下の画像を指定してください。"
                );
                return;
            }

            try {
                const response = await fetch(avatarAttachment.url);
                if (!response.ok) {
                    throw new Error("アバター画像のダウンロードに失敗しました。");
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                updateData.avatar = `data:${avatarAttachment.contentType};base64,${buffer.toString("base64")}`;
                changes.push("アバター");
            } catch (error) {
                await interaction.editReply("アバター画像の処理中にエラーが発生しました。");
                return;
            }
        }

        // バナー画像の処理
        if (bannerAttachment) {
            if (!bannerAttachment.contentType?.startsWith("image/")) {
                await interaction.editReply("バナー画像ファイルの形式が正しくありません。");
                return;
            }

            const maxSize = 8 * 1024 * 1024; // 8MB
            if (bannerAttachment.size > maxSize) {
                await interaction.editReply(
                    "バナー画像のファイルサイズが大きすぎます。8MB以下の画像を指定してください。"
                );
                return;
            }

            try {
                const response = await fetch(bannerAttachment.url);
                if (!response.ok) {
                    throw new Error("バナー画像のダウンロードに失敗しました。");
                }

                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                updateData.banner = `data:${bannerAttachment.contentType};base64,${buffer.toString("base64")}`;
                changes.push("バナー");
            } catch (error) {
                await interaction.editReply("バナー画像の処理中にエラーが発生しました。");
                return;
            }
        }

        // Bio の処理
        if (bio) {
            updateData.bio = bio;
            changes.push("自己紹介");
        }

        // ニックネームの処理
        if (nickname) {
            updateData.nick = nickname;
            changes.push("ニックネーム");
        }

        await guild.members.editMe(updateData);
        const message = `プロフィールを更新しました: ${changes.join("、")}`;
        await interaction.editReply(message);
    } catch (error) {
        console.error("プロフィール変更エラー:", error);
        await interaction.editReply("プロフィールの変更に失敗しました。");
    }
}
