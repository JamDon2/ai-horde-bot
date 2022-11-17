import { CommandInteraction } from "discord.js";
import { createStatusSheet } from "./createStatusSheet.js";
import API from "../api/client.js";
import { GenerationInput } from "stable-horde-api";
import { AxiosError } from "axios";

export default async function (
    apiKey: string,
    params: GenerationInput,
    interaction: CommandInteraction
) {
    let checkInterval: NodeJS.Timer;

    return await API.postAsyncGenerate(apiKey, params)
        .then(({ data }): Promise<string[] | null> => {
            return new Promise<string[] | null>((resolve, reject) => {
                const checkItem = async () => {
                    if (!data.id) {
                        reject("No data id");
                        return;
                    }

                    const { data: checkResult } = await API.getAsyncCheck(
                        data.id
                    ).catch((reason: AxiosError) => {
                        console.error(reason.stack);
                        console.error(reason.response?.data);
                        reject("Error checking status");
                        return { data: null };
                    });

                    if (!checkResult) {
                        reject("No response");
                        return;
                    }

                    if (checkResult.done) {
                        API.getAsyncStatus(data.id)
                            .then(({ data }) =>
                                resolve(
                                    data.generations?.map((e) => e.img ?? "") ??
                                        []
                                )
                            )
                            .catch(() => {
                                reject("Error getting status");
                            });
                        return;
                    }

                    const { data: workers } = await API.getWorkers().catch(
                        () => {
                            reject("Error getting workers.");
                            return { data: null };
                        }
                    );

                    if (!workers) return;

                    await interaction.editReply({
                        embeds: [
                            createStatusSheet("Generation in progress", {
                                "Status (🟢, 🟡, 🔴)": `${checkResult.finished?.toString()}/${checkResult.processing?.toString()}/${checkResult.waiting?.toString()}`,
                                "Queue Position":
                                    checkResult.queue_position?.toString() ??
                                    "",
                                Elapsed: `<t:${(
                                    interaction.createdAt.getTime() / 1000
                                ).toFixed(0)}:R>`,
                                ETA: `<t:${(
                                    new Date().getTime() / 1000 +
                                    (checkResult.wait_time ?? 0)
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
                        reject("Generation timed out");
                    }
                };
                checkInterval = setInterval(checkItem, 10000);
            });
        })
        .then((data) => {
            clearInterval(checkInterval);

            return data;
        })
        .catch(async (err) => {
            clearInterval(checkInterval);

            await interaction.editReply({
                content: "Error generating image. Please try again later.",
            });

            console.error(err);

            return;
        });
}
