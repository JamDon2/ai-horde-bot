import {
    AutocompleteInteraction,
    Client,
    CommandInteraction,
    SlashCommandBuilder,
} from "discord.js";
import { Model } from "mongoose";
import balance from "./interactions/balance.js";
import info from "./interactions/info.js";
import login from "./interactions/login.js";
import muteNotifications from "./interactions/mute-notifications.js";
import setpublic from "./interactions/setpublic.js";
import generate from "./interactions/generate.js";
import IUserDocument from "./types/IUserDocument.js";

export const commands: Omit<
    SlashCommandBuilder,
    "addSubcommandGroup" | "addSubcommand"
>[] = [
    login.command,
    balance.command,
    muteNotifications.command,
    setpublic.command,
    info.command,
    generate.command,
];

type InteractionHandlers = {
    command?: (
        interaction: CommandInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) => Promise<void>;

    autocomplete?: (
        interaction: AutocompleteInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) => Promise<void>;
};

export const interactionHandlers: {
    [key: string]: InteractionHandlers;
} = {
    login: { command: login.commandHandler },
    balance: { command: balance.commandHandler },
    "mute-notifications": { command: muteNotifications.commandHandler },
    setpublic: { command: setpublic.commandHandler },
    info: { command: info.commandHandler },
    generate: { command: generate.commandHandler },
};
