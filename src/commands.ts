import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js"
import { Model } from "mongoose"
import balance from "./commands/balance.js"
import info from "./commands/info.js"
import login from "./commands/login.js"
import muteNotifications from "./commands/mute-notifications.js"
import setpublic from "./commands/setpublic.js"
import stableHoard from "./commands/stable-hoard.js"
import IUserDocument from "./types/IUserDocument.js"

export const commands: Omit<
    SlashCommandBuilder,
    "addSubcommandGroup" | "addSubcommand"
>[] = [
    login.command,
    balance.command,
    muteNotifications.command,
    setpublic.command,
    info.command,
    stableHoard.command,
]

export const commandHandlers: {
    [key: string]: (
        interaction: CommandInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) => Promise<void>
} = {
    login: login.handler,
    balance: balance.handler,
    "mute-notifications": muteNotifications.handler,
    setpublic: setpublic.handler,
    info: info.handler,
    stableHoard: stableHoard.handler,
}
