import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection } from "discord.js";
import "dotenv/config";
import * as path from "path";
import * as fs from "fs";
import { Event } from "./Events";
import { Component } from "./Component";
import { Command } from "./Command";

export class ExtendedClient extends Client {
    commands: Collection<string, any> = new Collection(); //コマンド名で参照
    components: Collection<string, any> = new Collection(); //customIdで参照

    constructor(option: ClientOptions) {
        super(option);
    }

    start() {
        this.registerModules();
        this.login(process.env.TOKEN);
    }

    async importfile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerModules() {
        const main = path.join(__dirname, "..");
        const commandsPath = path.join(main, "commands");

        const commandsDirs = fs.readdirSync(commandsPath);
        const commandDatas: ApplicationCommandDataResolvable[] = [];
        const commandDatasDev: ApplicationCommandDataResolvable[] = [];

        commandsDirs.forEach(async (dir: string) => {
            const dirPath = path.join(commandsPath, dir);
            const commandFiles = fs.readdirSync(dirPath).filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));
            commandFiles.forEach(async (file: string) => {
                const filePath = path.join(dirPath, file);
                const command: Command = await this.importfile(filePath);
                this.commands.set(command.data.name, command);
                if (command.dev) {
                    commandDatasDev.push(command.data.toJSON());
                } else {
                    commandDatas.push(command.data.toJSON());
                }
            });
        });

        this.on("ready", () => {
            this.application?.commands.set(commandDatas);
            if (process.env.DEV_SERVER_ID) {
                this.application?.commands.set(commandDatasDev, process.env.DEV_SERVER_ID);
            }
        });

        const eventsPath = path.join(main, "events");
        const eventFiles = fs.readdirSync(eventsPath).filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));

        eventFiles.forEach(async (file: string) => {
            const filePath = path.join(eventsPath, file);
            const event: Event<keyof ClientEvents> = await this.importfile(filePath);
            this.on(event.name, event.execute);
        });

        const componentsPath = path.join(main, "components");
        const componentsDirs = fs.readdirSync(componentsPath);

        componentsDirs.forEach(async (directory: string) => {
            const dirPath = path.join(componentsPath, directory);
            const componentFiles = fs.readdirSync(dirPath).filter((file: string) => file.endsWith(".ts") || file.endsWith(".js"));
            componentFiles.forEach(async (file: string) => {
                const filePath = path.join(dirPath, file);
                const component: Component = await this.importfile(filePath);
                this.components.set(component.customId, component);
            });
        });
    }
}
