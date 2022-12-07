import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

import { clientRequired } from "../middlewares/middlewares.js";

class PlayerController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
    }

    get routes() {
        const router = new Router();

        router.use(clientRequired);
        router.post("/create", this.createPlayer);
        router.get("/:playerId", this.getPlayer);

        return router;
    }

    createPlayer = controller(async (req, res) => {
        const { username } = req.body;
        const player = await this.playerService.create(username);
        req.client.playerId = player.id;
        return httpStatus.Created(player);
    });

    getPlayer = controller(async (req, res) => {
        const { playerId } = req.params;
        const player = await this.playerService.get(playerId);
        return player
            ? httpStatus.OK(player)
            : httpStatus.NotFound(`Player with Id ${playerId} does not exist`);
    });
}

export default PlayerController;
