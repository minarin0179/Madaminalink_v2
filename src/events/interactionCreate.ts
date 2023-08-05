import {
    Colors,
    CommandInteraction,
    EmbedBuilder,
    Events,
    MessageComponentInteraction,
    ModalSubmitInteraction,
} from "discord.js";
import { client } from "../bot";
import { Event } from "../structures/Events";
import { reply } from "../utils/Reply";

export default new Event(Events.InteractionCreate, async interaction => {
    if (interaction.isAutocomplete()) return;
    try {
        //スラッシュコマンド
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            await command.execute({ client, interaction, args: interaction.options });
        }

        //コンポーネント
        else if (interaction.isMessageComponent() || interaction.isModalSubmit()) {
            const [customId, ...args] = interaction.customId.split(/[;:,]/);
            const component = client.components.get(customId);
            if (!component) return;
            await component.execute({ client, interaction, args });
        }
    } catch (e: any) {
        await showError(interaction, e).catch(console.log);
    }
});

const showError = async (
    interaction: CommandInteraction | MessageComponentInteraction | ModalSubmitInteraction,
    e: any
) => {
    let description = "";
    switch (e.code) {
        case 50013:
            description =
                "マダミナリンクに十分な権限がありません\n権限の設定を確認してください\n(マダミナリンクより上位のロールは操作できません)";
            break; //Missing Permissions
        case 30005:
            description = "ロール数が上限に達しています\nロールを減らしてから再度お試しください";
            break; //Maximum number of roles reached
        case 30013:
            description = "チャンネル数が上限に達しています\nチャンネルを減らしてから再度お試しください";
            break; //Maximum number of channels reached
        default:
            return reply(interaction, {
                content:
                    "エラーが発生しました、下記のエラーメッセージを添えて報告して下さい \n 【サポートサーバー】 → https://discord.gg/6by68EJ3e7",
                embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(e.stack)],
            });
    }
    console.log(interaction, e);
    return reply(interaction, {
        embeds: [new EmbedBuilder().setColor(Colors.Red).setDescription(description)],
    });
};
