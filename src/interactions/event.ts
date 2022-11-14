import { ButtonInteraction, EmbedBuilder, TextChannel } from "discord.js";
import { Model } from "mongoose";
import config from "../config.js";

import IUserDocument from "../types/IUserDocument.js";

export default {
    async buttonHandler(
        interaction: ButtonInteraction,
        User: Model<IUserDocument>
    ) {
        await interaction.deferReply({ ephemeral: true });

        const user = await User.findById(interaction.user.id);

        if (!user) {
            await interaction.followUp(
                "You are not logged in. Please use /login in the server."
            );
            return;
        }

        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.followUp(
                "You can only submit your own generations."
            );
            return;
        }

        let imageUrl;

        for (const embed of interaction.message.embeds) {
            if (embed.image) {
                imageUrl = embed.image.url;
            }
        }

        if (!imageUrl) {
            await interaction.followUp(
                "There was an error processing your submission."
            );
            return;
        }

        await interaction.followUp({
            content: "Your submission has been recorded.",
            ephemeral: true,
        });

        const channel = (await interaction.guild?.channels.fetch(
            config.event.channelId
        )) as TextChannel;

        if (channel)
            channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("New Submission")
                        .setDescription(`**User**: ${interaction.user.tag}`)
                        .setTimestamp(new Date())
                        .setColor("Blue")
                        .setImage(imageUrl),
                ],
            });
    },
};
