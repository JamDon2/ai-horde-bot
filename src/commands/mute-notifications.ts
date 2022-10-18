import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { Model } from "mongoose";

import IUserDocument from "../types/IUserDocument.js";

export default {
    command: new SlashCommandBuilder()
        .setName("mute-notifications")
        .setDescription(
            "Mute send or receive notifications with or without a threshold. Use with a threshold of 0 to unmute."
        )
        .addStringOption((option) =>
            option
                .setName("type")
                .setDescription("The type of notification to mute.")
                .setRequired(true)
                .addChoices(
                    { name: "Send", value: "send" },
                    { name: "Receive", value: "receive" }
                )
        )
        .addNumberOption((option) =>
            option
                .setName("threshold")
                .setDescription("The threshold to mute notifications at.")
        ),
    async handler(interaction: CommandInteraction, User: Model<IUserDocument>) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findById(interaction.user.id);

        if (!user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

        const type = interaction.options.get("type", true).value as
            | "send"
            | "receive";
        const threshold = interaction.options.get("threshold")?.value as
            | number
            | undefined;

        const thresholdSpecified = threshold !== undefined;
        const unmute = threshold === 0;

        user.notifications[type] = thresholdSpecified ? threshold : -1;

        await user.save();

        await interaction.followUp(
            unmute
                ? `You have unmuted ${type} notifications`
                : `You have muted ${type} notifications${
                      threshold
                          ? ` below ${threshold.toLocaleString("en-US")} kudos`
                          : ""
                  }.`
        );
    },
};
