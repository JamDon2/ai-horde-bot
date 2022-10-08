import fs from "fs";

type Config = {
    emojis: {
        [key: string]: string;
    };
    guildId: string;
    clientId: string;
};

const config: Config = JSON.parse(
    fs.readFileSync("./src/config.json", "utf-8")
);

export default config;
