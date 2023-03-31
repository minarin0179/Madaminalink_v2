import { SlashCommandBuilder } from "discord.js";
import { SlashCommand } from "../../structures/SlashCommand";
import { reply } from "../../utils/Reply";

const sames = [
    `https://tenor.com/view/shark-baby-shark-gif-21792225`,
    `https://tenor.com/view/wave-waving-friend-ikea-shark-gif-23925247`,
    `https://tenor.com/view/blahaj-shark-shonk-ikea-ikea-shark-gif-23975364`,
    `https://tenor.com/view/humanharvest407-keke-shark-gif-23988484`,
    `https://tenor.com/view/ikea-blahaj-doll-spinning-shark-gif-18118200`,
    `https://tenor.com/view/shark-attack-shark-dog-funny-gif-14398915`,
    `https://tenor.com/view/blahaj-ikea-ikea-shark-shark-shonk-gif-23975445`,
    `https://tenor.com/view/blahaj-gif-26227130`,
    `https://tenor.com/view/shark-typing-working-data-entry-telemarketing-gif-11704982`,
    `https://tenor.com/view/shark-sharkbite-computer-like-lol-gif-5054888`,
]

export default new SlashCommand({
    data: new SlashCommandBuilder()
        .setName('same')
        .setDescription('??????')
        .setDMPermission(true),
    execute: async ({ interaction }) => {
        await reply(interaction, sames[getRandomInt(sames.length)])
    }
})


const getRandomInt = (max: number) => Math.floor(Math.random() * max);
