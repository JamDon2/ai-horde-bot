import { CommandInteraction } from "discord.js";
import { createStatusSheet } from "./createStatusSheet.js";
import { Api, GenerationInput } from "./hordeApi.js";
export default async function (
    apiKey: string,
    params: GenerationInput,
    interaction: CommandInteraction
) {
    const hordeApi = new Api(apiKey);
    return await hordeApi.v2
        .postAsyncGenerate(params)
        .then((data): Promise<string[] | null> => {
            return new Promise<string[] | null>((resolve, reject) => {
                const checkItem = async () => {
                    if (!data.id) {
                        reject("No data id");
                        return;
                    }

                    const res = await hordeApi.v2
                        .getAsyncCheck(data.id)
                        .catch(() => {
                            reject("Error checking status");
                            return;
                        });

                    if (!res) {
                        reject("No response");
                        return;
                    }

                    if (res.done) {
                        clearInterval(checkInterval);
                        hordeApi.v2
                            .getAsyncStatus(data.id)
                            .then((res) =>
                                resolve(
                                    res.generations?.map((e) => e.img ?? "") ??
                                        []
                                )
                            );
                        return;
                    }

                    const workers = await hordeApi.v2.getWorkers();

                    await interaction.editReply({
                        embeds: [
                            createStatusSheet("Generation in progress", {
                                "Status (🟢, 🟡, 🔴)": `${res.finished?.toString()}/${res.processing?.toString()}/${res.waiting?.toString()}`,
                                "Queue Position":
                                    res.queue_position?.toString() ?? "",
                                Elapsed: `<t:${(
                                    interaction.createdAt.getTime() / 1000
                                ).toFixed(0)}:R>`,
                                ETA: `<t:${(
                                    new Date().getTime() / 1000 +
                                    (res.wait_time ?? 0)
                                ).toFixed(0)}:R>`,
                                "Active Workers": workers
                                    .filter((f) => !f.paused)
                                    .length.toFixed(0),
                            }),
                            ...(interaction.createdAt.getTime() +
                                1000 * 60 * 1 <
                            Date.now()
                                ? [
                                      {
                                          title: "Stable Horde Currently Under Load",
                                          description:
                                              "Stable Horde is currently under load, Stable Horde is a community driven stable diffusion cluster. You can help by running a worker. You can find more information [here](https://stablehorde.net).",
                                      },
                                  ]
                                : []),
                        ],
                    });
                    if (
                        interaction.createdAt.getTime() + 1000 * 60 * 10 <=
                        Date.now()
                    ) {
                        clearInterval(checkInterval);
                        reject("Generation timed out");
                    }
                };
                const checkInterval = setInterval(checkItem, 10000);
            });
        })
        .catch(async () => {
            await interaction.editReply({
                content: "Error generating image. Please try again later.",
            });
            return null;
        });
}
