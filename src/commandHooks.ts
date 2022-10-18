import { Client, CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import autorole from "./hooks/autorole.js";
import IUserDocument from "./types/IUserDocument.js";

const commandHooks: {
    [key: string]: ((
        interaction: CommandInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) => Promise<void>)[];
} = {
    preCommand: [],
    inCommand: [autorole],
    postCommand: [],
};

export async function preCommand(
    interaction: CommandInteraction,
    User: Model<IUserDocument>,
    client: Client
) {
    for (const hook of commandHooks.preCommand) {
        await hook(interaction, User, client);
    }
}

export async function inCommand(
    interaction: CommandInteraction,
    User: Model<IUserDocument>,
    client: Client
) {
    for (const hook of commandHooks.inCommand) {
        await hook(interaction, User, client);
    }
}

export async function postCommand(
    interaction: CommandInteraction,
    User: Model<IUserDocument>,
    client: Client
) {
    for (const hook of commandHooks.postCommand) {
        await hook(interaction, User, client);
    }
}
