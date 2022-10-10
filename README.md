# Running

## Prerequisites

-   [Docker](https://www.docker.com/)
-   [Docker Compose](https://docs.docker.com/compose/)

## Running

-   `cd` into the project directory
-   Build the docker image: `sudo docker build -t stable-horde-bot .`
-   Copy `.env.example` to `.env` and fill in the values
-   Make a copy of `config.example.json` and name it `config.json` and fill it in
-   Start the bot: `sudo docker-compose up` (use the `-d` flag to run detached)
