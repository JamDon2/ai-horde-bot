import { AxiosError } from "axios";
import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Model } from "mongoose";

import API from "../api/client.js";
import config from "../config.js";
import IUser from "../types/IUser.js";
import splitUsername from "../util/splitUsername.js";

export default {
    command: new SlashCommandBuilder()
        .setName("info")
        .setDescription("Query your or others' user info.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to query.")
        ),
    async commandHandler(
        interaction: CommandInteraction,
        { User }: { User: Model<IUser> }
    ) {
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

        await interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setTitle(user.username)
                    .setDescription(
                        `**Kudos**: ${(
                            userDetails.kudos as number
                        ).toLocaleString("en-US")}\n**Worker count**: ${
                            userDetails.worker_count
                        }\n**Trusted**: ${userDetails.trusted ? "Yes" : "No"}`
                    )
                    .setURL(
                        `${config.horde.baseUrl}/users/${
                            splitUsername(user.username).id
                        }`
                    )
                    .addFields([
                        {
                            name: "Usage",
                            value: `Megapixelsteps generated: ${(
                                userDetails.usage!.megapixelsteps as number
                            ).toLocaleString("en-US")}\nRequests made: ${(
                                userDetails.usage!.requests as number
                            ).toLocaleString("en-US")}`,
                            inline: true,
                        },
                        {
                            name: "Contributions",
                            value: `Megapixelsteps generated: ${(
                                userDetails.contributions!
                                    .megapixelsteps as number
                            ).toLocaleString("en-US")}\nRequests fulfilled: ${(
                                userDetails.contributions!
                                    .fulfillments as number
                            ).toLocaleString("en-US")}`,
                            inline: true,
                        },
                    ]),
            ],
        });
    },
};
