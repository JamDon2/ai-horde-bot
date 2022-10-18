import { Client, CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import config from "../config.js";
import IUserDocument from "../types/IUserDocument.js";
import api from "../api/client.js";

export default async function autorole(
    interaction: CommandInteraction,
    User: Model<IUserDocument>,
    client: Client
) {
    if (config.autorole.enabled && interaction.guild) {
        const member = await interaction.guild.members.fetch(
            interaction.user.id
        );

        const hasWorker = member.roles.cache.has(config.autorole.worker);
        const hasTrusted = member.roles.cache.has(config.autorole.trusted);

        if (hasWorker && hasTrusted) return;

        const user = await User.findOne({ id: interaction.user.id });

        if (!user) return;

        const userDetails = (await api
            .get(`/users/${user.username.split("#")[1]}`)
            .then((res) => res.data)
            .catch((error) => {
                if (error.response?.status === 404) {
                    return { error: "username" };
                }

                return { error: "unknown" };
            })) as any | { error: string };

        const worker = userDetails.worker_count > 0;
        const trusted = userDetails.trusted;

        console.log(worker, trusted);

        if (config.autorole.worker && worker && !hasWorker) {
            await member.roles.add(config.autorole.worker);
        }

        if (config.autorole.trusted && trusted && !hasTrusted) {
            await member.roles.add(config.autorole.trusted);
        }
    }
}
