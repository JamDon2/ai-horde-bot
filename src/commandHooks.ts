import { Client, CommandInteraction } from "discord.js";
import autorole from "./hooks/autorole.js";
import Models from "./types/models.js";

const commandHooks: {
    [key: string]: ((
        interaction: CommandInteraction,
        models: Models,
        client: Client
    ) => Promise<void>)[];
} = {
    preCommand: [],
    inCommand: [],
    postCommand: [autorole],
};

export async function preCommand(
    interaction: CommandInteraction,
    { User, Generation, KudosEscrow }: Models,
    client: Client
) {
    for (const hook of commandHooks.preCommand) {
        await hook(interaction, { User, Generation, KudosEscrow }, client);
    }
}

export async function postCommand(
    interaction: CommandInteraction,
    { User, Generation, KudosEscrow }: Models,
    client: Client
) {
    for (const hook of commandHooks.postCommand) {
        await hook(interaction, { User, Generation, KudosEscrow }, client);
    }
}
