import fs from "fs";

type Config = {
    emojis: {
        [key: string]: {
            value: number;
            message: string | null | undefined;
        };
    };
    horde: {
        baseUrl: string;
        name: string;
    };
    defaultMessage: string;
    useEmojiNames: boolean;
    clientId: string;
};

const config: Config = JSON.parse(fs.readFileSync("./config.json", "utf-8"));

export default config;
