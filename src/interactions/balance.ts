import { AxiosError } from "axios";
import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import API from "../api/client.js";
import Models from "../types/models.js";
import splitUsername from "../util/splitUsername.js";

export default {
    command: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("Query your or others' Kudos balance.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to query.")
        ),
    async commandHandler(interaction: CommandInteraction, { User }: Models) {
        await interaction.deferReply({ ephemeral: true });

        const userArg = interaction.options.get("user");

        const querySelf = !userArg || userArg?.user?.id == interaction.user.id;

        const queryUser =
            interaction.options.getUser("user") || interaction.user;

        const user = await User.findById(queryUser.id);

        if (!user || (!user.public && !querySelf)) {
            await interaction.followUp(
                querySelf
                    ? "You are not logged in. Please use /login in the server."
                    : "The target user is not logged in, or has not set their profile as public."
            );
            return;
        }

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

        await interaction.followUp(
            `<@${queryUser.id}> has ${(
                userDetails.kudos as number
            ).toLocaleString("en-US")} Kudos.`
        );
    },
};
