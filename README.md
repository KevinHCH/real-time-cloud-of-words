# Real-Time Cloud of Words
> This repository is an example of how to create a real-time word cloud that allows users to join a room, post what they think about a topic, and have that information populate to the other users already in the room. All of this was made with Next.js, Tailwind CSS, Express, WebSockets, and Redis using Upstash to provide scalable and efficient real-time communication.

![Demo of the project](./docs/demo.gif "Demo of the project")

## How to run this locally
- clone the repo
- install the dependencies with the command: `pnpm install`
- create the `.env` file on the `client` and `server` folder and complete it with your upstash keys
- run the project with the command from the root folder: `pnpm run dev`