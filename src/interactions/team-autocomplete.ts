import { AutocompleteInteraction } from "discord.js";
import API from "../api/client.js";

export default {
    async commandHandler(interaction: AutocompleteInteraction) {
        const query = interaction.options.getFocused(true).value.toLowerCase();

        const { data: teams } = await API.getTeams();

        if (teams.length === 0) return interaction.respond([]);

        const selectedTeams = teams.filter(
            (t) =>
                t.name?.toLowerCase().includes(query) ||
                t.id?.toLowerCase().includes(query)
        );

        return interaction.respond(
            selectedTeams
                .map((t) => ({
                    name: t.name || "",
                    value: t.id || "",
                }))
                .slice(0, 25)
        );
    },
};
