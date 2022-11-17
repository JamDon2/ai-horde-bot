import { AxiosError } from "axios";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import API from "../api/client.js";
import Models from "../types/models.js";

export default {
    command: new SlashCommandBuilder()
        .setName("maintenance")
        .setDescription("Update maintenance status for a worker.")
        .addStringOption((option) =>
            option.setName("worker").setDescription("The worker to update.")
        )
        .addBooleanOption((option) =>
            option.setName("value").setDescription("The new value.")
        ),

    async commandHandler(interaction: CommandInteraction, { User }: Models) {
        await interaction.deferReply({ ephemeral: true });

        const worker = interaction.options.get("worker", true).value as string;
        const value = interaction.options.get("value", true).value as boolean;

        const user = await User.findById(interaction.user.id);

        if (!user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

        let error = false;

        const { data: userDetails } = await API.putWorkerSingle(
            worker,
            user.apiKey,
            { maintenance: value }
        ).catch((reason: AxiosError) => {
            error = true;

            const status = reason.response?.status;

            if (status == 404) {
                interaction.followUp("Worker not found.");
            } else if (status == 403) {
                interaction.followUp("You do not own that worker.");
            } else {
                console.error(reason.stack);
                console.error(reason.response?.data);
                interaction.followUp("Unknown error.");
            }

            return { data: null };
        });

        if (error || !userDetails) return;

        await interaction.followUp(`Worker updated.`);
    },
};
