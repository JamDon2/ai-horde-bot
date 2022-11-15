import { Client, CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import autorole from "./hooks/autorole.js";
import IGeneration from "./types/IGeneration.js";
import IKudosEscrow from "./types/IKudosEscrow.js";
import IUser from "./types/IUser.js";

const commandHooks: {
    [key: string]: ((
        interaction: CommandInteraction,
        models: {
            User: Model<IUser>;
            Generation: Model<IGeneration>;
            KudosEscrow: Model<IKudosEscrow>;
        },
        client: Client
    ) => Promise<void>)[];
} = {
    preCommand: [],
    inCommand: [],
    postCommand: [autorole],
};

export async function preCommand(
    interaction: CommandInteraction,
    {
        User,
        Generation,
        KudosEscrow,
    }: {
        User: Model<IUser>;
        Generation: Model<IGeneration>;
        KudosEscrow: Model<IKudosEscrow>;
    },
    client: Client
) {
    for (const hook of commandHooks.preCommand) {
        await hook(interaction, { User, Generation, KudosEscrow }, client);
    }
}

export async function postCommand(
    interaction: CommandInteraction,
    {
        User,
        Generation,
        KudosEscrow,
    }: {
        User: Model<IUser>;
        Generation: Model<IGeneration>;
        KudosEscrow: Model<IKudosEscrow>;
    },
    client: Client
) {
    for (const hook of commandHooks.postCommand) {
        await hook(interaction, { User, Generation, KudosEscrow }, client);
    }
}
