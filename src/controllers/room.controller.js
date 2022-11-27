import { Router } from "express";

import controller from "./index.js";
import { clientRequired, playerRequired } from "./middlewares.js";
import httpStatus from "./responses.js";

class RoomController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
    }

    get routes() {
        const router = new Router();

        router.use(clientRequired);
        router.use(playerRequired);

        router.post("/create", this.createRoom);
        router.post("/join/:roomId", this.joinRoom);
        router.post("/cancel-join", this.cancelJoin);
        router.get("/:roomId", this.getRoom);

        return router;
    }

    createRoom = controller(async (req, res) => {
        // check if already in room;
        const playerId = req.playerId;

        const room = await this.roomService.create(playerId);

        return httpStatus.Created(room);
    });

    joinRoom = controller(async (req, res) => {
        // check if already in room;
        const playerId = req.playerId;
        const { roomId } = req.params;

        await this.roomService.joinRequest(roomId, playerId);

        return httpStatus.Accepted();
    });

    cancelJoin = controller(async (req, res) => {
        await this.roomService.cancelJoinRequest(req.playerId);

        return httpStatus.Accepted();
    });

    getRoom = controller(async (req, res) => {
        const { roomId } = req.params;
        const playerRoomId = await this.roomService.getPlayerRoomId(
            req.playerId
        );

        if (roomId === playerRoomId) {
            const room = await this.roomService.get(roomId);
            return httpStatus.OK(room);
        } else {
            return httpStatus.Unauthorized();
        }
    });
}

export default RoomController;
