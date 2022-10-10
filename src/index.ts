import {
    Client,
    EmbedBuilder,
    GatewayIntentBits,
    Partials,
    User,
} from "discord.js";
import Mustache from "mustache";
import "dotenv/config";

import db from "./db/client.js";
import config from "./config.js";
import { commandHandlers } from "./commands.js";
import api from "./api/client.js";

const usersCollection = db.collection("users");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Reaction, Partials.Message],
});

client.on("interactionCreate", (interaction) => {
    if (!interaction.isCommand()) return;

    if (!commandHandlers[interaction.commandName]) return;

    commandHandlers[interaction.commandName](interaction, usersCollection);
});

client.on("messageReactionAdd", async (reaction, user) => {
    const emojiIdentifier = config.useEmojiNames
        ? reaction.emoji.name
        : reaction.emoji.id;

    const emojiDetails = config.emojis[emojiIdentifier || ""];

    if (!emojiDetails) return;

    const message = reaction.message.partial
        ? await reaction.message.fetch()
        : reaction.message;

    user = user.partial ? await user.fetch() : user;

    if (message.author.id === user.id) {
        await reaction.users.remove(user);
        return;
    }

    const sender = await usersCollection.findOne({ _id: user.id });
    const recipient = await usersCollection.findOne({ _id: message.author.id });

    if (!sender || !recipient) {
        if (!sender)
            user.createDM()
                .then((dm) =>
                    dm.send(
                        "You are not logged in. Please use /login in the server."
                    )
                )
                .catch((err) => {
                    console.error(err);
                });
        else if (!recipient)
            message.author
                .createDM()
                .then((dm) =>
                    dm.send(
                        "Someone has tried to give you kudos, but you are not logged in. Please use /login in the server."
                    )
                )
                .catch((err) => {
                    console.error(err);
                });

        await reaction.users.remove(user);
        return;
    }

    const receiveMessage = Mustache.render(
        emojiDetails.message || config.defaultMessage,
        {
            amount: emojiDetails.value.toLocaleString("en-US"),
            user_mention: `<@${user.id}> `,
            message_url: message.url,
        },
        undefined,
        { escape: (val) => val }
    );

    await api
        .post(
            "/kudos/transfer",
            {
                username: recipient.username,
                amount: emojiDetails.value,
            },
            { headers: { apikey: sender.apiKey } }
        )
        .then(() => {
            user.createDM()
                .then((dm) =>
                    dm.send(
                        `You have given <@${
                            message.author.id
                        }> ${emojiDetails.value.toLocaleString("en-US")} kudos.`
                    )
                )
                .catch((err) => {
                    console.error(err);
                });
            message.author
                .createDM()
                .then((dm) =>
                    dm.send({
                        embeds: [
                            new EmbedBuilder().setDescription(receiveMessage),
                        ],
                    })
                )
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch(async (error: any) => {
            await reaction.users.remove(user as User);

            if (
                error.response?.status === 400 &&
                error.response?.data?.message === "Not enough kudos."
            ) {
                user.createDM()
                    .then((dm) => dm.send("You don't have enough kudos."))
                    .catch((err) => {
                        console.error(err);
                    });
            } else {
                console.error(error);
            }
        });
});

client.login(process.env.TOKEN);
