import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Collection } from "mongodb";

import api from "../api/client.js";
import IUserDocument from "../types/IUserDocument.js";

export default {
    command: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Query your Kudos balance."),
    async handler(
        interaction: CommandInteraction,
        collection: Collection<IUserDocument>
    ) {
        await interaction.deferReply({ ephemeral: true });

        const user = await collection.findOne({ _id: interaction.user.id });

        if (!user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

        const userDetails = (await api
            .get(`/users/${user.username.split("#")[1]}`)
            .then((res) => res.data)
            .catch((error) => {
                if (error.response?.status === 404) {
                    return { error: "username" };
                }

                return { error: "unknown" };
            })) as { kudos: number } | { error: string };

        if ("error" in userDetails) {
            if (userDetails.error == "username") {
                await interaction.followUp(
                    "Invalid username. Try logging in again."
                );
            } else {
                await interaction.followUp("An unknown error occurred.");
            }
            return;
        }

        await interaction.followUp(
            `You have ${userDetails.kudos.toLocaleString("en-US")} Kudos.`
        );
    },
};
