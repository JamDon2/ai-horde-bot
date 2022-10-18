import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Model } from "mongoose";
import api from "../api/client.js";
import KudosEscrow from "../models/KudosEscrow.js";
import IUserDocument from "../types/IUserDocument.js";
import { sendKudos } from "../util/sendKudos.js";

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
    async handler(
        interaction: CommandInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) {
        await interaction.deferReply({ ephemeral: true });

        const apiKey = interaction.options.get("api-key", true).value as string;

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

        const result = await User.findById(interaction.user.id);

        if (result) {
            result.apiKey = apiKey;
            result.username = data.username;

            await result.save();

            interaction.followUp({
                content: "Your API key has been updated.",
                ephemeral: true,
            });
        } else {
            const user = new User({
                _id: interaction.user.id,
                apiKey,
                username: data.username,
            });

            await user.save();

            const docs = await KudosEscrow.find({ to: interaction.user.id });

            docs.forEach(async (doc) => {
                const sender = await User.findById(doc.from);

                if (sender) {
                    await sendKudos(
                        client,
                        User,
                        {
                            id: sender._id,
                            apiKey: sender.apiKey,
                            sendDM: true,
                        },
                        { id: user._id, username: user.username, sendDM: true },
                        doc.emoji,
                        doc.messageURL
                    ).catch(console.error);
                }

                await doc.delete();
            });

            interaction.followUp({
                content: "You have linked your account.",
                ephemeral: true,
            });
        }
    },
};
