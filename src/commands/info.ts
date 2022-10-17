import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Model } from "mongoose";

import api from "../api/client.js";
import IUserDocument from "../types/IUserDocument.js";

export default {
    command: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Query your or others' user info.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to query.")
        ),
    async handler(interaction: CommandInteraction, User: Model<IUserDocument>) {
        await interaction.deferReply({ ephemeral: true });

        const userArg = interaction.options.get("user");

        const querySelf = !userArg || userArg?.user?.id == interaction.user.id;

        const queryUser =
            interaction.options.getUser("user") || interaction.user;

        const user = await User.findById(queryUser.id);

        if (!querySelf && (!user || !user.public)) {
            await interaction.followUp(
                "The target user is not logged in, or has not set their profile as public."
            );
            return;
        } else if (querySelf && !user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

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

        if ("error" in userDetails) {
            if (userDetails.error == "username") {
                await interaction.followUp("The stored username is invalid.");
            } else {
                await interaction.followUp("An unknown error occurred.");
            }
            return;
        }

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle(user.username)
                    .setDescription(
                        `**Kudos**: ${userDetails.kudos.toLocaleString(
                            "en-US"
                        )}`
                    )
                    .addFields([
                        {
                            name: "Usage",
                            value: `Megapixelsteps generated: ${userDetails.usage.megapixelsteps.toLocaleString(
                                "en-US"
                            )}\nRequests made: ${userDetails.usage.requests.toLocaleString(
                                "en-US"
                            )}`,
                            inline: true,
                        },
                        {
                            name: "Contributions",
                            value: `Megapixelsteps generated: ${userDetails.contributions.megapixelsteps.toLocaleString(
                                "en-US"
                            )}\nRequests fulfilled: ${userDetails.contributions.fulfillments.toLocaleString(
                                "en-US"
                            )}`,
                            inline: true,
                        },
                    ]),
            ],
        });
    },
};
