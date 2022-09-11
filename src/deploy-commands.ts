import { REST, RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
require('dotenv').config()

import * as fs from "fs"
import * as path from "path"
import { Command } from "./structures/SlashCommand"

const commands: RESTPostAPIApplicationCommandsJSONBody[] = []
const commandPath = path.join(__dirname, 'commands')
const commandFiles = fs.readdirSync(commandPath)
    .filter((file: string) => file.endsWith('.ts'))


const importfile = (async (filePath: string) => {
    return (await import(filePath))?.default
})



const rest = new REST({ version: '10' }).setToken(process.env.TOKEN as string);

(async () => {
    try {
        for await (const file of commandFiles) {
            const filePath = path.join(commandPath, file)
            const command: Command = await importfile(filePath)
            commands.push(command.data.toJSON())
        }
        await rest.put(Routes.applicationCommands(process.env.CLIENT_ID as string), { body: commands })
            .then(() => console.log('Successfully registered application commands.'))
    } catch (err) {
        console.error(err)
    }
})()