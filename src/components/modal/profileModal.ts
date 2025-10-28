import { ModalBuilder, TextInputBuilder, TextInputStyle, FileUploadBuilder, LabelBuilder } from "discord.js";
import { Modal } from "../../structures/Modal";
import { reply } from "../../utils/Reply";

export default new Modal({
    customId: "profile",
    build: ({
        type,
        currentAvatar,
        currentBanner,
        currentBio,
        currentNickname,
    }: {
        type: "set";
        currentAvatar?: string | null;
        currentBanner?: string | null;
        currentBio?: string;
        currentNickname?: string;
    }) => {
        const avatarUpload = new FileUploadBuilder().setCustomId("avatar").setRequired(false);

        const avatarLabel = new LabelBuilder()
            .setLabel("アバター画像")
            .setDescription("アバター画像をアップロードしてください")
            .setFileUploadComponent(avatarUpload);

        const bannerUpload = new FileUploadBuilder().setCustomId("banner").setRequired(false);

        const bannerLabel = new LabelBuilder()
            .setLabel("バナー画像")
            .setDescription("バナー画像をアップロードしてください")
            .setFileUploadComponent(bannerUpload);

        const bioInput = new TextInputBuilder()
            .setCustomId("bio")
            .setStyle(TextInputStyle.Paragraph)
            .setMaxLength(1024)
            .setPlaceholder(currentBio || "自己紹介を入力")
            .setRequired(false);

        if (currentBio) {
            bioInput.setValue(currentBio);
        }

        const bioLabel = new LabelBuilder().setLabel("自己紹介文").setTextInputComponent(bioInput);

        const nicknameInput = new TextInputBuilder()
            .setCustomId("nickname")
            .setStyle(TextInputStyle.Short)
            .setMaxLength(32)
            .setPlaceholder(currentNickname || "ニックネームを入力")
            .setRequired(false);

        if (currentNickname) {
            nicknameInput.setValue(currentNickname);
        }

        const nicknameLabel = new LabelBuilder().setLabel("ニックネーム").setTextInputComponent(nicknameInput);

        const modal = new ModalBuilder()
            .setCustomId(`profile:${type}`)
            .setTitle("プロフィールを設定")
            .addLabelComponents(avatarLabel, bannerLabel, bioLabel, nicknameLabel);

        return modal;
    },
    execute: async ({ interaction, args }) => {
        const guild = interaction.guild;

        if (!guild) {
            await reply(interaction, "このコマンドはサーバー内でのみ使用できます。");
            return;
        }

        try {
            await interaction.deferReply();

            const updateData: {
                avatar?: string;
                banner?: string;
                bio?: string;
                nick?: string;
            } = {};

            const changes: string[] = [];

            // グローバルに保存された生データを取得
            const rawInteractionData = (global as any).rawInteractionData;
            const rawData = rawInteractionData ? rawInteractionData.get(interaction.id) : null;

            // discord.jsがパースしたcomponentsを使用
            // @ts-ignore
            const components = interaction.components;

            // resolvedデータを生データから取得
            const resolved = rawData?.data?.resolved || null;

            // アバター画像の処理
            if (components && components.length > 0) {
                // @ts-ignore
                const avatarComponent = components.find((c: any) => c.component?.customId === "avatar");

                if (avatarComponent?.component?.values && avatarComponent.component.values.length > 0) {
                    const attachmentId = avatarComponent.component.values[0];

                    // @ts-ignore
                    const attachments = interaction.attachments || resolved?.attachments;

                    let attachment = null;
                    if (attachments) {
                        if (attachments instanceof Map) {
                            attachment = attachments.get(attachmentId);
                        } else if (typeof attachments === "object") {
                            attachment = attachments[attachmentId];
                        }
                    }

                    if (attachment) {
                        if (!attachment.content_type?.startsWith("image/")) {
                            await interaction.editReply("アバター画像ファイルの形式が正しくありません。");
                            return;
                        }

                        const maxSize = 8 * 1024 * 1024; // 8MB
                        if (attachment.size > maxSize) {
                            await interaction.editReply(
                                "アバター画像のファイルサイズが大きすぎます。8MB以下の画像を指定してください。"
                            );
                            return;
                        }

                        const response = await fetch(attachment.url);
                        if (!response.ok) {
                            throw new Error("アバター画像のダウンロードに失敗しました。");
                        }

                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        updateData.avatar = `data:${attachment.content_type};base64,${buffer.toString("base64")}`;
                        changes.push("アバター");
                    }
                }
            }

            // バナー画像の処理
            if (components && components.length > 0) {
                // @ts-ignore
                const bannerComponent = components.find((c: any) => c.component?.customId === "banner");

                if (bannerComponent?.component?.values && bannerComponent.component.values.length > 0) {
                    const attachmentId = bannerComponent.component.values[0];

                    // @ts-ignore
                    const attachments = interaction.attachments || resolved?.attachments;

                    let attachment = null;
                    if (attachments) {
                        if (attachments instanceof Map) {
                            attachment = attachments.get(attachmentId);
                        } else if (typeof attachments === "object") {
                            attachment = attachments[attachmentId];
                        }
                    }

                    if (attachment) {
                        if (!attachment.content_type?.startsWith("image/")) {
                            await interaction.editReply("バナー画像ファイルの形式が正しくありません。");
                            return;
                        }

                        const maxSize = 8 * 1024 * 1024; // 8MB
                        if (attachment.size > maxSize) {
                            await interaction.editReply(
                                "バナー画像のファイルサイズが大きすぎます。8MB以下の画像を指定してください。"
                            );
                            return;
                        }

                        const response = await fetch(attachment.url);
                        if (!response.ok) {
                            throw new Error("バナー画像のダウンロードに失敗しました。");
                        }

                        const arrayBuffer = await response.arrayBuffer();
                        const buffer = Buffer.from(arrayBuffer);
                        updateData.banner = `data:${attachment.content_type};base64,${buffer.toString("base64")}`;
                        changes.push("バナー");
                    }
                }
            }

            // Bio の処理
            try {
                const bio = interaction.fields.getTextInputValue("bio");
                if (bio) {
                    updateData.bio = bio;
                    changes.push("自己紹介");
                }
            } catch (error) {
                // フィールドが存在しない場合は無視
            }

            // ニックネームの処理
            try {
                const nickname = interaction.fields.getTextInputValue("nickname");
                if (nickname) {
                    updateData.nick = nickname;
                    changes.push("ニックネーム");
                }
            } catch (error) {
                // フィールドが存在しない場合は無視
            }

            if (changes.length === 0) {
                await interaction.editReply("少なくとも1つの項目を入力してください。");
                return;
            }

            await guild.members.editMe(updateData);
            const message = `プロフィールを更新しました: ${changes.join("、")}`;
            await interaction.editReply(message);
        } catch (error) {
            console.error("プロフィール変更エラー:", error);
            await interaction.editReply("プロフィールの変更に失敗しました。");
        }
    },
});
