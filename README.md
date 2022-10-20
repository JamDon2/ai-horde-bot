# AI Horde Bot

This discord bot will automatically transfer kudos from the person taking a reaction, to the owner of the comment being reacted to.

It will also provide some commands to get information about Stable Horde accounts directly from discord.

## Using

To use this bot on your own server, simply [invite it](https://discord.com/oauth2/authorize?client_id=1019572037360025650&permissions=8192&scope=bot)

You will also need to setup your own emojis which will trigger the bot to award kudos from the Stable horde. The names have to match the emoji keys you see in [config.json](config.example.json)

Any time that emoji is reacted with, it will transfer the same amount of kudos. For this to work, both the reactor and the reactee, needs to have logged in to the Kudos bot with `/login` command. If either of them has not, the emoji will be removed and whoever is missing it, will receive a private message from the bot to log in.

If the reactor doesn't have enough kudos, the emoji will also be removed.

Use this functionality to promote good behaviour with something that has a bit more utility than random emojis

## Configuration

The bot is configured using the `config.json` file.

Make a copy of `config.example.json` with the name `config.json`.

The `config.json` file contains the following properties:

-   `emojis`: An object containing the emojis that the bot will react to. The keys should be the emoji names or IDs, depending on whether `useEmojiNames` is enabled.
    -   `value`: The amount of kudos associated with the emoji.
    -   `message`: The message the recipient for the transfer gets (optional)
        -   {{amount}}: The amount of kudos formatted with the region `en-US`
        -   {{user_mention}}: The mention string for the sender
        -   {{message_url}}: A URL for the message that was reacted to
-   `horde`: This contains the specific horde to be used.
    -   `baseUrl`: The API endpoint for the horde.
-   `autorole`: This contains the autorole module configuration.
    -   `enabled`: Whether the module is enabled.
    -   `worker`: An object containing server IDs, and the worker role for the server in question.
    -   `trusted`: An object containing server IDs, and the worker role for the server in question.
-   `generate`: This contains the generate module configuration.
    -   `enabled`: Whether the module is enabled.
    -   `bannedWords`: An array of words that are not allowed in the prompt.
    -   `nsfw`: Whether to enable the `nsfw` flag, and disable `censor_nsfw`
-   `escrowtime`: Time in seconds to remember a reward for, if the recipient isn't logged in
-   `defaultMessage`: Same as `message`, a fallback if no message is specified for the emoji.
-   `useEmojiNames`: If enabled, the bot will use the emoji names instead of IDs for finding the emoji.
-   `clientId`: The client ID of the bot.

The `.env` file stores the token and the database details.

It should contain these variables:

-   `TOKEN`: The token of the bot
-   `MONGODB_URI`: The URI of the MongoDB database
-   `MONGODB_DATABASE`: The name of the database

## Deploying

### Prerequisites

-   [Docker](https://www.docker.com/)
-   [Docker Compose](https://docs.docker.com/compose/)
-   [Node.js](https://nodejs.org/en/) (>= 16.17.0, for deploying commands)
-   [npm](https://www.npmjs.com/) (for deploying commands)

### Deploying Commands

Install the dependencies with `npm install`, and run the following command in the root of the project:

```bash
npx ts-node-esm src/deploy-commands.ts
```

### Running

-   `cd` into the project directory
-   Build the docker image: `docker build -t ai-horde-bot .`
-   Copy `.env.example` to `.env` and fill in the values
-   If you want to change to your own emoj names, make a copy of `config.example.json` and name it `config.json` and fill it in
-   Start the bot: `docker-compose up` (use the `-d` flag to run detached)
