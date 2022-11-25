import { createServer } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";

import routes from "./controllers/routes.js";

import registerSocketConnections from "./lib/Socket/index.js";

import RoomService from "./modules/Room/room.service.js";
import PlayerService from "./modules/Player/player.service.js";
// import GameService from "./modules/Game/game.service.js";

import EventBroker from "./lib/EventBroker/index.js";

import dotenv from "dotenv";
dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", routes);

const httpServer = createServer(app);
const socketServer = new SocketServer(httpServer, { cors: { origin: "*" } });

registerSocketConnections(socketServer);

async function bootstrap() {
    const eventBroker = new EventBroker();
    await eventBroker.connect();
    const eventChannel = await eventBroker.createChannel("scribbly");

    let memoryStore;

    RoomService.bootstrap(memoryStore, eventChannel);
    PlayerService.boostrap(memoryStore, eventChannel);
    // GameService.boostrap(memoryStore, eventChannel);
}

bootstrap();

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT);
httpServer.on("listening", () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
httpServer.on("error", (err) => {
    console.log(`Server encountered error! ${err.message}`);
});
