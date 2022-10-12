import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Collection } from "mongodb";
import balance from "./commands/balance.js";
import login from "./commands/login.js";
import muteNotifications from "./commands/mute-notifications.js";
import HordeDocument from "./types/document.js";

export const commands: Omit<
    SlashCommandBuilder,
    "addSubcommandGroup" | "addSubcommand"
>[] = [login.command, balance.command, muteNotifications.command];

export const commandHandlers: {
    [key: string]: (
        interaction: CommandInteraction,
        collection: Collection<HordeDocument>
    ) => Promise<void>;
} = {
    login: login.handler,
    balance: balance.handler,
    "mute-notifications": muteNotifications.handler,
};
