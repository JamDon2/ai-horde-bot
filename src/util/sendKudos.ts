import { Client, EmbedBuilder } from "discord.js";
import { Model } from "mongoose";
import Mustache from "mustache";
import api from "../api/client.js";
import config from "../config.js";
import IUserDocument from "../types/IUserDocument.js";

export async function sendKudosSilent(
    apiKey: string,
    to: string,
    amount: number
) {
    try {
        const res = await api.post(
            "/kudos/transfer",
            {
                username: to,
                amount: amount,
            },
            { headers: { apikey: apiKey } }
        );

        return { error: null, data: res.data, status: res.status };
    } catch (error: any) {
        return {
            error,
            data: error.response?.data?.message,
            status: error.response?.status,
        };
    }
}

export async function sendKudos(
    client: Client,
    User: Model<IUserDocument>,
    from: { id: string; apiKey: string; sendDM: boolean },
    to: { id: string; username: string; sendDM: boolean },
    emoji: string | null,
    messageURL?: string
) {
    const emojiDetails = config.emojis[emoji || ""];

    if (!emojiDetails) return;

    const result = await sendKudosSilent(
        from.apiKey,
        to.username,
        emojiDetails.value
    );

    if (result.error) {
        if (result.status === 400 && result.data === "Not enough kudos.") {
            const sender = await client.users.fetch(from.id);

            if (!sender) return;

            sender
                .createDM()
                .then((dm) => dm.send("You don't have enough kudos."));
        }

        return;
    }

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
                dm.send(
                    `You have given <@${
                        to.id
                    }> ${emojiDetails.value.toLocaleString("en-US")} kudos.`
                )
            );
    }

    if (to.sendDM) {
        recipient.createDM().then((dm) =>
            dm.send({
                embeds: [new EmbedBuilder().setDescription(receiveMessage)],
            })
        );
    }

    await User.findByIdAndUpdate(from.id, {
        $inc: { totalDonated: emojiDetails.value },
    });
}
