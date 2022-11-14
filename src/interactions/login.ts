import { AxiosError } from "axios";
import { Client, CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Model } from "mongoose";
import API from "../api/client.js";
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
    async commandHandler(
        interaction: CommandInteraction,
        User: Model<IUserDocument>,
        client: Client
    ) {
        await interaction.deferReply({ ephemeral: true });

        const apiKey = interaction.options.get("api-key", true).value as string;

        let error = false;

        if (apiKey === "0000000000") {
            await interaction.followUp("You cannot log in as anonymous.");
            return;
        }

        const { data } = await API.getFindUser(apiKey).catch(
            (reason: AxiosError) => {
                error = true;

                const status = reason.response?.status;

                if (status == 404) {
                    interaction.followUp("Invalid API key.");
                } else {
                    console.error(reason.stack);
                    console.error(reason.response?.data);
                    interaction.followUp("Unknown error.");
                }

                return { data: null };
            }
        );

        if (error || !data) return;

        const result = await User.findById(interaction.user.id);

        if (result) {
            result.apiKey = apiKey;
            result.username = data.username as string;

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
