import {
    APIEmbedField,
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";
import { Model } from "mongoose";

import API from "../api/client.js";
import IUser from "../types/IUser.js";
import splitUsername from "../util/splitUsername.js";
import { AxiosError } from "axios";
import { WorkerDetailsStable } from "stable-horde-api";
import config from "../config.js";

export default {
    command: new SlashCommandBuilder()
        .setName("workers")
        .setDescription("Query your or others' workers.")
        .addUserOption((option) =>
            option.setName("user").setDescription("The user to query.")
        ),
    async commandHandler(interaction: CommandInteraction, User: Model<IUser>) {
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
            splitUsername(user.username).id,
            user.apiKey
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

        const workerData: WorkerDetailsStable[] = [];

        for (const worker of userDetails.worker_ids!) {
            const { data } = await API.getWorkerSingle(
                worker,
                user.apiKey
            ).catch((reason: AxiosError) => {
                return { data: null };
            });

            if (data) {
                workerData.push(data);
            }
        }

        const fields: APIEmbedField[] = workerData.map((worker) => {
            return {
                name: worker.name || "",
                value: `[API Page](${config.horde.baseUrl}/v2/workers/${
                    worker.id
                })\n${
                    worker.info ? `Info: ${worker.info}\n` : ""
                }MPS generated: ${
                    worker.megapixelsteps_generated
                }\nRequests completed: ${worker.requests_fulfilled}\nNSFW: ${
                    worker.nsfw ? "Yes" : "No"
                }\nTrusted: ${worker.trusted ? "Yes" : "No"}\nMaintenance: ${
                    worker.maintenance_mode ? "Yes" : "No"
                }\nCan do img2img: ${worker.img2img ? "Yes" : "No"}`,
                inline: true,
            };
        });

        const embed = new EmbedBuilder();

        embed
            .setTitle("Worker List")
            .addFields(...fields)
            .setFooter({ text: user.username });

        await interaction.followUp({ embeds: [embed] });
    },
};
