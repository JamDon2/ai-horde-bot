import { CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import config from "../config.js";
import IUserDocument from "../types/IUserDocument.js";
import api from "../api/client.js";
import { UserDetails } from "../util/myApi.js";

export default async function autorole(
    interaction: CommandInteraction,
    User: Model<IUserDocument>
) {
    if (config.autorole.enabled && interaction.guild) {
        const member = await interaction.guild.members.fetch(
            interaction.user.id
        );

        const serverHasWorker = config.autorole.worker[interaction.guild.id];
        const serverHasTrusted = config.autorole.trusted[interaction.guild.id];

        const hasWorker =
            serverHasWorker &&
            member.roles.cache.has(
                config.autorole.worker[interaction.guild.id]
            );
        const hasTrusted =
            serverHasTrusted &&
            member.roles.cache.has(
                config.autorole.trusted[interaction.guild.id]
            );

        if (hasWorker && hasTrusted) return;

        const user = await User.findById(interaction.user.id);

        if (!user) return;

        const userDetails = (await api
            .get(`/users/${user.username.split("#")[1]}`)
            .then((res) => res.data)
            .catch((error) => {
                if (error.response?.status === 404) {
                    return { error: "username" };
                }

                return { error: "unknown" };
            })) as UserDetails | { error: string };

        if ("error" in userDetails) {
            if (userDetails.error == "username") {
                await interaction.followUp("The stored username is invalid.");
            } else {
                await interaction.followUp("An unknown error occurred.");
            }
            return;
        }
        const worker = userDetails.worker_count > 0;
        const trusted = userDetails.trusted;

        if (serverHasWorker && worker && !hasWorker) {
            await member.roles.add(
                config.autorole.worker[interaction.guild.id]
            );
        }

        if (serverHasTrusted && trusted && !hasTrusted) {
            await member.roles.add(
                config.autorole.trusted[interaction.guild.id]
            );
        }
    }
}
