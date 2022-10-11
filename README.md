# Stable Horde Kudos Bot

This discord bot will automatically transfer kudos from the person taking a reaction, to the owner of the comment being reacted to.

It will also provide some commands to get information about Stable Horde accounts directly from discord.

## Using

To use this bot on your own server, simply [invite it](https://discord.com/login?redirect_to=%2Foauth2%2Fauthorize%3Fclient_id%3D1019572037360025650%26permissions%3D8192%26scope%3Dbot)

You will also need to setup your own emojis which will trigger the bot to award kudos from the Stable horde. The names have to match the emoji keys you see in [/config.json](config.json)

Any time that emoji is reacted with, it will transfer the same amount of kudos. For this to work, both the reactor and the reactee, needs to have logged in to the Kudos bot with `/login` command. If either of them has not, the emoji will be removed and whoever is missing it, will receive a private message from the bot to log in.

If the reactor doesn't have enough kudos, the emoji will also be removed.

Use this functionality to promote good behaviour with something that has a bit more utility than random emojis

## Running

### Prerequisites

-   [Docker](https://www.docker.com/)
-   [Docker Compose](https://docs.docker.com/compose/)

### Running

-   `cd` into the project directory
-   Build the docker image: `sudo docker build -t stable-horde-bot .`
-   Copy `.env.example` to `.env` and fill in the values
-   Make a copy of `config.example.json` and name it `config.json` and fill it in
-   Start the bot: `sudo docker-compose up` (use the `-d` flag to run detached)
