import { Client, ClientEvents, ClientOptions, Collection, RichPresenceAssets } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import { Command } from "./structures/Command";
import { Event } from "./structures/Events";
import { Button } from "./structures/Button";

require('dotenv').config()

export class ExtendedClient extends Client {

    commands: Collection<string, any> = new Collection() //コマンド名で参照
    components: Collection<string, any> = new Collection() //customIdで参照

    constructor(option: ClientOptions) {
        super(option)
    }

    start() {
        this.registerModules()
        this.login(process.env.TOKEN)
    }

    async importfile(filePath: string) {
        return (await import(filePath))?.default
    }

    async registerModules() {
        const commandsPath = path.join(__dirname, 'commands')
        const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'))

        commandFiles.forEach(async (file: string) => {
            const filePath = path.join(commandsPath, file)
            const command: Command = await this.importfile(filePath)
            this.commands.set(command.data.name, command)
        })


        const eventsPath = path.join(__dirname, 'events')
        const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts'))

        eventFiles.forEach(async (file: string) => {
            const filePath = path.join(eventsPath, file)
            const event: Event<keyof ClientEvents> = await this.importfile(filePath)
            this.on(event.name, event.execute)
        })

        const components = ['buttons', 'selectmenus']
        const buttonPath = path.join(__dirname, 'components', 'buttons')
        const buttonFiles = fs.readdirSync(buttonPath).filter((file: string) => file.endsWith('.ts'))

        buttonFiles.forEach(async (file: string) => {
            const filePath = path.join(buttonPath, file)
            const button: Button = await this.importfile(filePath)
            this.components.set(button.customId, button)
        })
    }
}