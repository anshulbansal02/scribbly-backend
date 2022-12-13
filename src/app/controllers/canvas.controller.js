import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

class CanvasController {
    constructor(services) {
        this.canvasService = services.canvasService;
        this.gameService = services.gameService;
        this.pcm = services.pcm;

        this.eventExchange(services.eventChannel, services.pcm);
    }

    eventExchange(eventChannel, pcm) {
        const canvasChannel = eventChannel.subchannel("canvas");
        const ICVE = this.canvasService.events;
    }

    get routes() {
        const router = new Router();

        return router;
    }
}

export default CanvasController;
