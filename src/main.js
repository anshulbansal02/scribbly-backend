import { createServer } from "http";
import dotenv from "dotenv";

import { EventBroker } from "./lib/EventBroker/index.js";
import { Store } from "./lib/Store/index.js";

import RoomService from "./modules/Room/room.service.js";
import PlayerService from "./modules/Player/player.service.js";

import AppController from "./controllers/app.js";

dotenv.config();

async function bootstrap() {
    // Services Initialization
    const eventBroker = new EventBroker();
    await eventBroker.connect();
    const eventChannel = await eventBroker.createChannel("scribbly");

    const store = await Store.createStore();

    const roomService = new RoomService(store, eventChannel);
    const playerService = new PlayerService(store, eventChannel);

    // Server & Root Controller Intitialization
    const httpServer = createServer();

    new AppController(httpServer, {
        roomService,
        playerService,
    });

    const PORT = process.env.PORT || 4000;
    httpServer.listen(PORT);
    httpServer.on("listening", () => {
        console.log(`Server listening on http://127.0.0.1:${PORT}`);
    });
    httpServer.on("error", (err) => {
        console.log(`Server encountered error! ${err.message}`);
    });
}

bootstrap();
