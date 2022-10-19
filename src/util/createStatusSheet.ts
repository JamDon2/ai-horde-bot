import { EmbedBuilder } from "discord.js";

export const createStatusSheet = (
    title: string,
    details: {
        [key: string]: string;
    }
) =>
    new EmbedBuilder().setTitle(title).addFields(
        Object.entries(details).map(([name, value]) => ({
            name,
            value,
            inline: true,
        }))
    );
