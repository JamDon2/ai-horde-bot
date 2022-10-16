# AI Horde Bot

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

### Running

-   `cd` into the project directory
-   Build the docker image: `sudo docker build -t ai-horde-bot .`
-   Copy `.env.example` to `.env` and fill in the values
-   Make a copy of `config.example.json` and name it `config.json` and fill it in
-   Start the bot: `sudo docker-compose up` (use the `-d` flag to run detached)
