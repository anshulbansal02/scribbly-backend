import { Router } from "express";

import controller from "./index.js";

class PlayerController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
    }

    get routes() {
        const router = new Router();

        router.post("/create", this.createPlayer);
        router.get("/:playerId", this.getPlayer);

        return router;
    }

    createPlayer = controller(async (req, res) => {
        const { username } = req.body;
        const player = await this.playerService.create(username);
        req.client.playerId = player.id;
        return player;
    });

    getPlayer = controller(async (req, res) => {
        const { playerId } = req.params;
        return await this.playerService.get(playerId);
    });
}

export default PlayerController;
