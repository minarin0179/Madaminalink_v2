import {
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    FileUploadBuilder,
    LabelBuilder,
    Base64Resolvable,
    GuildMemberEditMeOptions,
    Attachment,
    DiscordAPIError,
} from "discord.js";
import { Modal } from "../../structures/Modal";
import { MyConstants } from "../../constants/constants";

interface ProfileModalBuildOptions {
    defaultName: string;
    currentNickname?: string;
}

export default new Modal({
    customId: "profile",
    build: ({ defaultName, currentNickname }: ProfileModalBuildOptions) => {
        const avatarUpload = new FileUploadBuilder()
            .setCustomId("avatar")
            .setRequired(false);

        const avatarLabel = new LabelBuilder()
            .setLabel("アバター画像")
            .setDescription("アバター画像をアップロードしてください")
            .setFileUploadComponent(avatarUpload);

        const bannerUpload = new FileUploadBuilder()
            .setCustomId("banner")
            .setRequired(false);

        const bannerLabel = new LabelBuilder()
            .setLabel("バナー画像")
            .setDescription("バナー画像をアップロードしてください")
            .setFileUploadComponent(bannerUpload);

        const nicknameInput = new TextInputBuilder()
            .setCustomId("nickname")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(MyConstants.maxNicknameLength)
            .setPlaceholder(defaultName)
            .setRequired(false);

        if (currentNickname) {
            nicknameInput.setValue(currentNickname);
        }

        const nicknameLabel = new LabelBuilder()
            .setLabel("ニックネーム")
            .setTextInputComponent(nicknameInput);

        const modal = new ModalBuilder()
            .setCustomId(`profile`)
            .setTitle("プロフィールを設定")
            .addLabelComponents(avatarLabel, bannerLabel, nicknameLabel);

        return modal;
    },
    execute: async ({ interaction }) => {
        const guild = interaction.guild;

        if (!guild) {
            await interaction.editReply(
                "このコマンドはサーバー内でのみ使用できます。"
            );
            return;
        }

        await interaction.deferReply({ ephemeral: true });

        const updateData: GuildMemberEditMeOptions = {};
        const avatar = interaction.fields.getUploadedFiles("avatar")?.first();
        const banner = interaction.fields.getUploadedFiles("banner")?.first();

        if (avatar) {
            if (!isImageAttachment(avatar)) {
                await interaction.editReply(
                    "アバター画像ファイルの形式が正しくありません。"
                );
                return;
            }
            if (!isValidImageSize(avatar)) {
                await interaction.editReply(
                    `アバター画像のファイルサイズが大きすぎます。${MyConstants.maxFileSizeMB}MB以下の画像を指定してください。`
                );
                return;
            }
            updateData.avatar = await urlToBase64(avatar.url);
        }

        if (banner) {
            if (!isImageAttachment(banner)) {
                await interaction.editReply(
                    "バナー画像ファイルの形式が正しくありません。"
                );
                return;
            }
            if (!isValidImageSize(banner)) {
                await interaction.editReply(
                    `バナー画像のファイルサイズが大きすぎます。${MyConstants.maxFileSizeMB}MB以下の画像を指定してください。`
                );
                return;
            }
            updateData.banner = await urlToBase64(banner.url);
        }

        updateData.nick =
            interaction.fields.getTextInputValue("nickname") || "";

        try {
            await guild.members.editMe(updateData);
            await interaction.editReply("プロフィールを更新しました");
        } catch (error) {
            let message = "プロフィールの更新中にエラーが発生しました。再度お試しください。";

            if (error instanceof DiscordAPIError && error.code === 50035 && "errors" in error.rawError) {
                const errors = error.rawError.errors;

                if (hasErrorCode(errors, "avatar", "AVATAR_RATE_LIMIT")) {
                    message = "アバターの変更が早すぎます。しばらく待ってから再度お試しください。";
                } else if (hasErrorCode(errors, "banner", "BANNER_RATE_LIMIT")) {
                    message = "バナーの変更が早すぎます。しばらく待ってから再度お試しください。";
                } else {
                    message = "プロフィールの更新に失敗しました。入力内容を確認してください。";
                }
            }

            await interaction.editReply(message);
        }
    },
});

const isImageAttachment = (attachment: Attachment): boolean =>
    attachment.contentType?.startsWith("image/") ?? false;
const isValidImageSize = (attachment: Attachment): boolean =>
    attachment.size <= MyConstants.maxFileSize;

const urlToBase64 = async (url: string): Promise<Base64Resolvable> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`画像のダウンロードに失敗しました。`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content_type = response.headers.get("content-type") || "image/png";
    const base64Data = `data:${content_type};base64,${buffer.toString("base64")}`;

    return base64Data;
};


// Discord APIエラーのフィールド構造を表す型
interface DiscordErrorField {
    _errors?: Array<{ code: string; message: string }>;
    [key: string]: unknown;
}

// 特定のフィールドに特定のエラーコードが含まれているかチェック
const hasErrorCode = (errors: unknown, field: string, code: string): boolean => {
    if (typeof errors !== "object" || errors === null) return false;
    if (!(field in errors)) return false;

    const fieldData = (errors as Record<string, unknown>)[field];
    if (typeof fieldData !== "object" || fieldData === null) return false;

    const fieldErrors = (fieldData as DiscordErrorField)._errors;
    return Array.isArray(fieldErrors) && fieldErrors.some(e => e.code === code);
};
