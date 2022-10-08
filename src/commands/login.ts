import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Collection, ObjectId } from "mongodb";

import api from "../api/client.js";

export default {
    command: new SlashCommandBuilder()
        .setName("login")
        .setDescription("Login with your API key.")
        .addStringOption((option) =>
            option
                .setName("api-key")
                .setDescription("Your API key.")
                .setRequired(true)
        ),
    async handler(interaction: CommandInteraction, collection: Collection) {
        await interaction.deferReply({ ephemeral: true });

        const apiKey = interaction.options.get("api-key", true).value;

        const data: { username: string } | { error: string } = (await api
            .get("/find_user", {
                headers: { apikey: apiKey },
            })
            .then((res) => res.data)
            .catch((error) => {
                if (error.response?.status === 404) {
                    return { error: "api-key" };
                }

                return { error: "unknown" };
            })) as { username: string } | { error: string };

        if ("error" in data) {
            if (data.error == "api-key") {
                await interaction.followUp("Invalid API key.");
            } else {
                await interaction.followUp("An unknown error occurred.");
            }
            return;
        }

        const result = await collection.findOne({ _id: interaction.user.id });

        if (result) {
            await collection.updateOne(
                { _id: interaction.user.id },
                {
                    $set: {
                        apiKey,
                        username: data.username,
                    },
                }
            );

            interaction.followUp({
                content: "Your API key has been updated.",
                ephemeral: true,
            });
        } else {
            await collection.insertOne({
                _id: interaction.user.id as unknown as ObjectId,
                apiKey,
                username: data.username,
            });

            interaction.followUp({
                content: "You have linked your account.",
                ephemeral: true,
            });
        }
    },
};
