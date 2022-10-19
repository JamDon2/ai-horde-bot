import {
    AttachmentBuilder,
    CommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

import IUserDocument from "../types/IUserDocument.js";
import { imageJoin } from "../util/imageJoin.js";
import { Model } from "mongoose";

import { hordeGenerate } from "../util/async.js";
const styles: Record<string, (s: string) => string> = {
    raw: (p) => p,
    fantasy: (p) =>
        `${p} fantasy artwork epic detailed and intricate digital painting trending on artstation by wlop octane render`,
    rutkowski: (p) =>
        `${p} fantasy artwork epic detailed and intricate digital painting trending on artstation concept art by greg rutkowski`,
    anime: (p) =>
        `${p} digital 2d anime illustration, by Makoto Shinkai, by Hayao Miyazaki, detailed award-winning still frame`,
    spooky: (p) =>
        `${p} creepy hyperrealistic detailed horror fantasy concept art, by Wayne Barlowe, by Zdzislaw Beksinski, by Seb McKinnon`,
    painting: (p) =>
        `${p} digitized painting, highly detailed, sharp focus, impasto brush strokes, acclaimed artwork by gaston bussiere, by j. c. leyendecker`,
    flat: (p) =>
        `${p} ui art icon by victo ngai, kilian eng, lois van baarle, flat`,
    butter: (p) =>
        `${p} award-winning butter sculpture at the Minnesota State Fair, made of butter, dairy creation`,
};

const cleanNumberInput = (s: string | undefined, fallback: number) => {
    try {
        return s ? Number(s) : fallback;
    } catch {
        return fallback;
    }
};

export default {
    command: new SlashCommandBuilder()
        .setName("generate")
        .setDescription("use stable hoard")
        .addStringOption((option) =>
            option
                .setName("prompt")
                .setDescription("What to ask stable diffusion")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("style")
                .setDescription("What style to use")
                .setRequired(true)
                .addChoices(
                    ...Object.keys(styles).map((style) => ({
                        name: style,
                        value: style,
                    }))
                )
        )
        .addStringOption((option) =>
            option
                .setName("seed")
                .setDescription("The seed to use")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("steps")
                .setDescription("The number of steps to use")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("width")
                .setDescription("The width of the image")
                .setRequired(false)
                .addChoices(
                    ...[...Array(17).keys()].slice(1).map((i) => ({
                        name: (i * 64).toString(),
                        value: (i * 64).toString(),
                    }))
                )
        )
        .addStringOption((option) =>
            option
                .setName("height")
                .setDescription("The height of the image")
                .setRequired(false)
                .addChoices(
                    ...[...Array(17).keys()].slice(1).map((i) => ({
                        name: (i * 64).toString(),
                        value: (i * 64).toString(),
                    }))
                )
        )
        .addStringOption((option) =>
            option
                .setName("iterations")
                .setDescription("The number of images to generate(colab only)")
                .setRequired(false)
                .addChoices(
                    ...[
                        { name: "single", value: "1" },
                        { name: "4 panel", value: "4" },
                        { name: "9 panel", value: "9" },
                    ]
                )
        )
        .addStringOption((option) =>
            option
                .setName("cfg")
                .setDescription("The cfg to use")
                .setRequired(false)
        ),

    async handler(interaction: CommandInteraction, User: Model<IUserDocument>) {
        const optionsString = interaction.options.data
            .map((option) => `${option.name}: ${option.value}`)
            .join(", ");
        if (!interaction.replied) {
            await interaction.reply(
                `Generating image with stablehoard with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
            );
        } else {
            await interaction.editReply(
                `Generating image with stablehoard with stable diffusion with options ${optionsString}. Ideal generation time is below 2 minutes`
            );
        }

        const iseed = interaction.options.get("seed")?.value as string;

        const createSeed =
            iseed && !iseed.includes("[")
                ? Number(iseed)
                : Math.round(Math.random() * 10000);

        const newSeed = createSeed;

        const bannedWords = [
            "child",
            "children",
            "kid",
            "kids",
            "baby",
            "babies",
            "infant",
            "infants",
            "toddler",
            "toddlers",
            "teen",
            "teens",
            "teenager",
            "teenagers",
            "preteen",
            "preteens",
            "preteenager",
            "preteenagers",
            "schoolgirl",
            "schoolgirls",
            "schoolboy",
            "schoolboys",
        ];

        if (
            bannedWords.some((word) =>
                (interaction.options.get("prompt")?.value as string)
                    .toLowerCase()
                    .includes(word)
            )
        ) {
            await interaction.editReply(
                "Banned word detected. Please try again with a different prompt."
            );
            return;
        }

        const seed = newSeed;

        const width = cleanNumberInput(
            interaction.options.get("width")?.value as string,
            512
        );
        const cfg = cleanNumberInput(
            interaction.options.get("cfg")?.value as string,
            7.5
        );
        const iterations = cleanNumberInput(
            interaction.options.get("iterations")?.value as string,
            1
        );

        const height = cleanNumberInput(
            interaction.options.get("height")?.value as string,
            512
        );

        const steps = cleanNumberInput(
            interaction.options.get("steps")?.value as string,
            50
        );

        const prompt = interaction.options.get("prompt")?.value as string;

        console.log(width, height);

        const isfw = false;
        const params = {
            prompt: prompt,
            censor_nsfw: isfw,
            nsfw: !isfw,
            params: {
                seed: `${seed}`,
                width: width,
                height: height,
                cfg_scale: cfg,
                steps: steps,
                n: iterations,
                variant_amount: 1,
            },
        };
        const data = await hordeGenerate(
            (await User.findById(interaction.user.id))?.apiKey ?? "00000000",
            params,
            interaction
        );

        if (data == null) {
            return;
        }

        const buff: Buffer[] = data.map((d) => Buffer.from(d, "base64"));
        const messageData = {
            content: null,

            files: [
                new AttachmentBuilder(await imageJoin(buff)).setName(
                    `generation.png`
                ),
            ],
            embeds: [
                {
                    title: prompt.slice(0, 200) + "...",
                    fields: [
                        {
                            name: "Seed",
                            value: `${seed}`,
                            inline: true,
                        },
                    ],
                    image: {
                        url: `attachment://generation.png`,
                    },
                },
            ],
        };

        await interaction.editReply(messageData);
    },
};
