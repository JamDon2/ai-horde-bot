import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Model } from "mongoose";
import balance from "./commands/balance.js";
import login from "./commands/login.js";
import muteNotifications from "./commands/mute-notifications.js";
import IUserDocument from "./types/IUserDocument.js";

export const commands: Omit<
    SlashCommandBuilder,
    "addSubcommandGroup" | "addSubcommand"
>[] = [login.command, balance.command, muteNotifications.command];

export const commandHandlers: {
    [key: string]: (
        interaction: CommandInteraction,
        userModel: Model<IUserDocument>
    ) => Promise<void>;
} = {
    login: login.handler,
    balance: balance.handler,
    "mute-notifications": muteNotifications.handler,
};
