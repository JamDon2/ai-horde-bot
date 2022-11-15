import { CommandInteraction, SlashCommandBuilder } from "discord.js";

import Models from "../types/models.js";

export default {
    command: new SlashCommandBuilder()
        .setName("setpublic")
        .setDescription(
            "Set whether your the linked account is publicly visible or not."
        )
        .addBooleanOption((option) =>
            option
                .setName("public")
                .setDescription(
                    "Whether your account will be set as public or private."
                )
                .setRequired(true)
        ),
    async commandHandler(interaction: CommandInteraction, { User }: Models) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findById(interaction.user.id);

        if (!user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

        const isPublic = interaction.options.get("public", true)
            .value as boolean;

        user.public = isPublic;

        await user.save();

        await interaction.followUp(
            `Your account is now ${isPublic ? "public" : "private"}.`
        );
    },
};
