import dotenv from "dotenv";

import { EventBroker } from "./lib/EventBroker/index.js";
import { Store } from "./lib/Store/index.js";

import RoomService from "./modules/Room/room.service.js";
import PlayerService from "./modules/Player/player.service.js";

import AppController from "./app/controllers/app.controller.js";

dotenv.config();

async function bootstrap() {
    // Services Initialization
    const eventBroker = new EventBroker();
    await eventBroker.connect();
    const eventChannel = await eventBroker.createChannel("scribbly");

    const store = await Store.createStore();

    const roomService = new RoomService(store, eventChannel);
    const playerService = new PlayerService(store, eventChannel);

    // Root Controller Intitialization
    const app = new AppController({
        roomService,
        playerService,
        eventChannel,
    });

    app.listen(process.env.PORT || 4000);
}

bootstrap();
