import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Collection } from "mongodb";
import login from "./commands/login.js";

export const commands: Omit<
    SlashCommandBuilder,
    "addSubcommandGroup" | "addSubcommand"
>[] = [login.command];

export const commandHandlers: {
    [key: string]: (
        interaction: CommandInteraction,
        collection: Collection
    ) => Promise<void>;
} = { login: login.handler };
