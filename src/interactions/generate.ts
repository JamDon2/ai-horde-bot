import {
    AttachmentBuilder,
    CommandInteraction,
    SlashCommandBuilder,
} from "discord.js";

import IUserDocument from "../types/IUserDocument.js";
import { imageJoin } from "../util/imageJoin.js";
import { Model } from "mongoose";

import hordeGenerate from "../util/hordeGenerate.js";
import config from "../config.js";
import sharp from "sharp";

const styles: Record<string, (s: string) => string> = {
    raw: (p) => p,
    terror_ink: (p) =>
        `a terrifying ink drawing of a ${p}, by Ko Young Hoon, by Yoshitaka Amano, Charcoal Art, Ink, Oil Paint, Concept Art, Color Grading, Dramatic, Intentional camera movement, Lonely, Cracks, With Imperfections, in a symbolic and meaningful style, insanely detailed and intricate, hypermaximalist, elegant, ornate, hyper realistic, super detailed, a ghost, covered in spiderweb, eerie, feeling of dread, decay, samhain`,
    nightmare: (p) =>
        `${p} by Aaron Horkey, by Adonna Khare, by Carrie Ann Baade, by Jeff Lemire, by Junji Ito, horror, creepy, dark, eldritch, fantasy`,
    abandoned: (p) =>
        `Old found footage of hyper realistic ${p}, abandoned, liminal space, horror, eerie, mysterious, noise and grain, dark hues, dark tones, single source of light, 35mm, Kodak Autochrome, floating particles, auto flash, auto focus`,
    witch_land: (p) =>
        `digital art of ${p}, witch world, Halloween theme, scenic Halloween, highly detailed, zbrush, by artist Artgerm, by artist Stephen Hickman, by artist Carne griffiths`,
    nightmare_fairytale: (p) =>
        `horror ${p} in a dark forest, darkness, fog, very detailed, cold, Editorial illustration, gothic, evil, art by Sam Bosma, painting by H.P. Lovecraft`,
    elmstreet: (p) =>
        `drawing of ${p} by tim burton, by Aaron Horkey, by H R Giger, creepy, horror, sharp, focused, HD, detailed`,
    ennui: (p) => `${p}, black and white, foggy, negative, eerie`,
    dark_fantay: (p) =>
        `highly detailed digital painting of ${p}, highly realistic fantasy concept art by Darek Zabrocki and Zdzisław Beksiński, paint strokes, intricate, eerie scenery, dark volumetric lighting, triadic color scheme, very coherent, sharp focus, illustration, film grain, spooky vibe`,
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
        .setDescription("Generate an image with Stable Diffusion.")
        .addStringOption((option) =>
            option
                .setName("prompt")
                .setDescription("Your prompt")
                .setRequired(true)
        )
        .addStringOption((option) =>
            option
                .setName("style")
                .setDescription("The style to use")
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
                .setDescription("The image seed")
                .setRequired(false)
        )
        .addStringOption((option) =>
            option
                .setName("steps")
                .setDescription("The number of steps to generate")
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
                .setDescription("The number of images to generate")
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

    async commandHandler(
        interaction: CommandInteraction,
        User: Model<IUserDocument>
    ) {
        await interaction.deferReply();

        const optionsString = interaction.options.data
            .map((option) => `*${option.name}*: ${option.value}`)
            .join(", ");

        if (!config.generate.enabled) {
            await interaction.followUp({
                content: `Sorry, but image generation is currently disabled. Please try again later.`,
                ephemeral: true,
            });
            return;
        }

        await interaction.followUp(
            `Generating image on the horde with options ${optionsString}. This may take a while.`
        );

        const iseed = interaction.options.get("seed")?.value as string;

        const createSeed =
            iseed && !iseed.includes("[")
                ? Number(iseed)
                : Math.round(Math.random() * 10000);

        const newSeed = createSeed;

        if (
            config.generate.bannedWords.some((word) =>
                (interaction.options.get("prompt")?.value as string)
                    .toLowerCase()
                    .includes(word)
            )
        ) {
            await interaction.followUp(
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

        const style = interaction.options.get("style", true).value as string;

        if (!(style in styles)) {
            await interaction.followUp(
                "Invalid style. Please try again with a different style."
            );
            return;
        }

        const prompt = styles[style](
            interaction.options.get("prompt", true).value as string
        );

        const params = {
            prompt: prompt,
            censor_nsfw: !config.generate.nsfw,
            nsfw: config.generate.nsfw,
            params: {
                seed: iterations === 1 ? `${seed}` : undefined,
                width: width,
                height: height,
                cfg_scale: cfg,
                steps: steps,
                n: iterations,
                variant_amount: 1,
            },
        };

        const data = await hordeGenerate(
            (await User.findById(interaction.user.id))?.apiKey ?? "0000000000",
            params,
            interaction
        );

        if (data == null) {
            return;
        }

        const buff: Buffer[] = data.map((d: any) => Buffer.from(d, "base64"));

        let image = await imageJoin(buff);

        const sharpImage = sharp(image);

        const maxSize = 8000000;

        if (image.length > maxSize) {
            const { height, width } = await sharpImage.metadata();

            if (height && width) {
                const newHeight = Math.floor(
                    (height * (maxSize * 0.8)) / image.length
                );
                const newWidth = Math.floor(
                    (width * (maxSize * 0.8)) / image.length
                );

                sharpImage.resize(newWidth, newHeight);
            }
        }

        image = await sharpImage.toBuffer();

        const messageData = {
            files: [new AttachmentBuilder(image).setName(`generation.png`)],
            embeds: [
                {
                    title:
                        prompt.length > 200
                            ? prompt.slice(0, 200) + "..."
                            : prompt,
                    fields:
                        iterations === 1
                            ? [
                                  {
                                      name: "Seed",
                                      value: `${seed}`,
                                      inline: true,
                                  },
                              ]
                            : undefined,
                    image: {
                        url: `attachment://generation.png`,
                    },
                },
            ],
        };

        await interaction.editReply(messageData);
    },
};
