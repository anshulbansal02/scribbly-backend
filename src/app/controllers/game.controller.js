import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

class GameController {
    constructor(services) {
        this.roomService = services.roomService;
        this.gameService = services.gameService;
        this.pcm = services.pcm;

        this.eventExchange(services.eventChannel, services.pcm);
    }

    eventExchange(eventChannel, pcm) {
        const roomChannel = eventChannel.subchannel("room");
        const gameChannel = eventChannel.subchannel("game");
        const IGE = this.gameService.events;
        const IRE = this.roomService.events;

        roomChannel.on(IRE.CREATED, async (room) => {
            await this.gameService.create(room.id);
        });
    }

    get routes() {
        const router = new Router();

        return router;
    }
}

export default GameController;
