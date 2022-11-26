import { Router } from "express";

import controller from "./index.js";

class RoomController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
    }

    get routes() {
        const router = new Router();

        router.post("/create", this.createRoom);
        router.post("/join/:roomId", this.joinRoom);
        router.post("/cancel-join", this.cancelJoin);
        router.get("/:roomId", this.getRoom);

        return router;
    }

    createRoom = controller(async (req, res) => {
        const { username } = req.body;
        const player = await this.playerService.create(username);
        req.client.playerId = player.id;
        return player;
    });

    joinRoom = controller(async (req, res) => {
        const { roomId } = req.params;
    });

    cancelJoin = controller(async (req, res) => {
        const { roomId } = req.params;
    });

    getRoom = controller(async (req, res) => {
        const { playerId } = req.params;
        return await this.playerService.get(playerId);
    });
}

export default RoomController;
