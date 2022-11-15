import { CommandInteraction } from "discord.js";
import { Model } from "mongoose";
import config from "../config.js";
import IUser from "../types/IUser.js";
import API from "../api/client.js";
import splitUsername from "../util/splitUsername.js";
import { AxiosError } from "axios";

export default async function autorole(
    interaction: CommandInteraction,
    User: Model<IUser>
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

        let error = false;

        const { data: userDetails } = await API.getUserSingle(
            splitUsername(user.username).id
        ).catch((reason: AxiosError) => {
            error = true;

            const status = reason.response?.status;

            if (status == 404) {
                interaction.followUp("User not found.");
            } else {
                console.error(reason.stack);
                console.error(reason.response?.data);
                interaction.followUp("Unknown error.");
            }

            return { data: null };
        });

        if (error || !userDetails) return;

        const worker = (userDetails.worker_count as number) > 0;
        const trusted = userDetails.trusted as boolean;

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
