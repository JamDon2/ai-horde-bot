import {
    CommandInteraction,
    EmbedBuilder,
    SlashCommandBuilder,
} from "discord.js";

import API from "../api/client.js";

export default {
    command: new SlashCommandBuilder()
        .setName("team")
        .setDescription("Find out information about a team")
        .addStringOption((option) =>
            option
                .setName("name")
                .setDescription("The name or ID of the team")
                .setAutocomplete(true)
                .setRequired(true)
        ),
    async commandHandler(interaction: CommandInteraction) {
        await interaction.deferReply({ ephemeral: true });

        const query = interaction.options
            .get("name", true)
            .value?.toString()
            .toLowerCase();

        const { data: teams } = await API.getTeams();

        if (teams.length === 0) {
            interaction.followUp("Unable to find team");
            return;
        }

        const team = teams.find(
            (t) =>
                t.name?.toLowerCase() === query || t.id?.toLowerCase() === query
        );

        if (!team) {
            interaction.followUp("Unable to find team");
            return;
        }

        const embed = new EmbedBuilder({
            title: "Worker Info",
            description: `Name: \`${team.name}\`
Info: ${team.info}
**Stats**
Requests Fulfilled: \`${team.requests_fulfilled}\`
Kudos: \`${team.kudos}\`
Online since: <t:${Math.floor(Date.now() / 1000) - (team.uptime ?? 0)}:R>
Workers: \`${team.worker_count}\`
Performance: \`${team.performance}\` Megapixelsteps per second
Speed: \`${team.speed}\` Megapixelsteps per second`,
            footer: { text: team.id! },
        });

        await interaction.followUp({ embeds: [embed] });
    },
};
