import { REST, Routes } from "discord.js";
import "dotenv/config";

import { commands } from "./interactions.js";

import config from "./config.js";

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN as string);

rest.put(Routes.applicationCommands(config.clientId), {
    body: commands.map((command) => command.toJSON()),
})
    .then((data) => {
        const { length: commandCount } = data as { length: number };
        console.log(
            `Successfully registered ${commandCount} application commands.`
        );
    })
    .catch(console.error);
