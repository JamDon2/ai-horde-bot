import { AxiosError } from "axios";
import { Client, EmbedBuilder } from "discord.js";
import { Model } from "mongoose";
import Mustache from "mustache";
import API from "../api/client.js";
import config from "../config.js";
import IUser from "../types/IUser.js";

export async function sendKudosSilent(
    apiKey: string,
    to: string,
    amount: number
) {
    const res = await API.postTransferKudos(apiKey, { amount, username: to });

    return res;
}

export async function sendKudos(
    client: Client,
    User: Model<IUser>,
    from: { id: string; apiKey: string; sendDM: boolean },
    to: { id: string; username: string; sendDM: boolean },
    emoji: string | null,
    messageURL?: string
) {
    const emojiDetails = config.emojis[emoji || ""];

    if (!emojiDetails) return;

    let error = false;

    await sendKudosSilent(from.apiKey, to.username, emojiDetails.value).catch(
        async (reason: AxiosError) => {
            error = true;

            if (
                reason.response?.status === 400 &&
                reason.response.data === "Not enough kudos."
            ) {
                const sender = await client.users.fetch(from.id);

                if (!sender) return;

                sender
                    .createDM()
                    .then((dm) =>
                        dm
                            .send("You don't have enough kudos.")
                            .catch(console.error)
                    )
                    .catch(console.error);
            }
        }
    );

    if (error) return;

    const sender = await client.users.fetch(from.id);
    const recipient = await client.users.fetch(to.id);

    if (!sender || !recipient) return;

    const receiveMessage = Mustache.render(
        emojiDetails.message || config.defaultMessage,
        {
            amount: emojiDetails.value.toLocaleString("en-US"),
            user_mention: `<@${from.id}> `,
            message_url: messageURL,
        },
        undefined,
        { escape: (val) => val }
    );

    if (from.sendDM) {
        sender
            .createDM()
            .then((dm) =>
                dm
                    .send(
                        `You have given <@${
                            to.id
                        }> ${emojiDetails.value.toLocaleString("en-US")} kudos.`
                    )
                    .catch(console.error)
            )
            .catch(console.error);
    }

    if (to.sendDM) {
        recipient
            .createDM()
            .then((dm) =>
                dm
                    .send({
                        embeds: [
                            new EmbedBuilder().setDescription(receiveMessage),
                        ],
                    })
                    .catch(console.error)
            )
            .catch(console.error);
    }

    await User.findByIdAndUpdate(from.id, {
        $inc: { totalDonated: emojiDetails.value },
    });
}
