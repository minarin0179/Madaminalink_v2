import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection } from "discord.js";
import * as path from "path";
import * as fs from "fs";
import { Event } from "./structures/Events";
import { Component } from "./structures/Component";
import { Command } from "./structures/Command";

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
        /* 
        const commandsPath = path.join(__dirname, 'commands')
        const commandFiles = fs.readdirSync(commandsPath).filter((file: string) => file.endsWith('.ts'))

        commandFiles.forEach(async (file: string) => {
            const filePath = path.join(commandsPath, file)
            const command: Command = await this.importfile(filePath)
            this.commands.set(command.data.name, command)
        }) */


        const commandsPath = path.join(__dirname, 'commands')
        const commandsDirs = fs.readdirSync(commandsPath)
        const commandDatas: ApplicationCommandDataResolvable[] = []

        commandsDirs.forEach(async (dir: string) => {
            const dirPath = path.join(commandsPath, dir)
            const commandFiles = fs.readdirSync(dirPath).filter((file: string) => file.endsWith('.ts'))
            commandFiles.forEach(async (file: string) => {
                const filePath = path.join(dirPath, file)
                const command: Command = await this.importfile(filePath)
                this.commands.set(command.data.name, command)
                commandDatas.push(command.data.toJSON())
            })
        })

        this.on('ready', () => {
            this.application?.commands.set(commandDatas)
        })

        const eventsPath = path.join(__dirname, 'events')
        const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith('.ts'))

        eventFiles.forEach(async (file: string) => {
            const filePath = path.join(eventsPath, file)
            const event: Event<keyof ClientEvents> = await this.importfile(filePath)
            this.on(event.name, event.execute)
        })

        const componentsPath = path.join(__dirname, 'components')
        const componentsDirs = fs.readdirSync(componentsPath)

        componentsDirs.forEach(async (directory: string) => {
            const dirPath = path.join(componentsPath, directory)
            const componentFiles = fs.readdirSync(dirPath).filter((file: string) => file.endsWith('.ts'))
            componentFiles.forEach(async (file: string) => {
                const filePath = path.join(dirPath, file)
                const component: Component = await this.importfile(filePath)
                this.components.set(component.customId, component)
            })
        })
    }
}