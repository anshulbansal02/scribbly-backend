import { Router } from "express";

import clientRequired from "./io/middleware.js";
import PlayerService from "./modules/Player/player.service.js";
import RoomService from "./modules/Room/room.service.js";

PlayerService.boostrap({}, {});
RoomService.bootstrap({}, {});

const playerService = PlayerService.service;
const roomService = RoomService.service;

const router = Router();

router.use(clientRequired);

router.post("/player/create", async (req, res) => {
    const { username } = req.body;
    const player = await playerService.create({ username });
    req.client.attachPlayerId(player.id);
    res.json(player);
});

router.post("/room/create", async (req, res) => {
    const room = await roomService.create(player);
    res.json(room);
});

router.post("/room/join", (req, res) => {
    const { roomId } = req.body;

    roomService.joinRequest(roomId, req.client.playerId);

    res.json({
        message: "OK",
    });
});

router.post("/room/join/cancel", (req, res) => {
    roomService.cancelJoinRequest(playerId);

    res.json({
        message: "OK",
    });
});

export default router;
