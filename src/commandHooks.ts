import { Client, CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import autorole from "./hooks/autorole.js";
import IUser from "./types/IUser.js";

const commandHooks: {
    [key: string]: ((
        interaction: CommandInteraction,
        User: Model<IUser>,
        client: Client
    ) => Promise<void>)[];
} = {
    preCommand: [],
    inCommand: [],
    postCommand: [autorole],
};

export async function preCommand(
    interaction: CommandInteraction,
    User: Model<IUser>,
    client: Client
) {
    for (const hook of commandHooks.preCommand) {
        await hook(interaction, User, client);
    }
}

export async function postCommand(
    interaction: CommandInteraction,
    User: Model<IUser>,
    client: Client
) {
    for (const hook of commandHooks.postCommand) {
        await hook(interaction, User, client);
    }
}
