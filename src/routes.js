import { Router } from "express";

import { PlayerService, RoomService } from "./services/index.js";
import { viewfy } from "./utils/index.js";

const router = Router();

router.post("/player/create", (req, res) => {
    const player = PlayerService.create("anshul");
    res.json(viewfy(player));
});

router.post("/room/create", (req, res) => {
    const player = PlayerService.create("anshul");
    const room = RoomService.create(player);

    console.log(room);

    res.json(viewfy(room));
});

router.post("/room/join", (req, res) => {
    const { playerId, roomId } = req.body;

    // Move to auth middleware
    const player = PlayerService.get(playerId);

    const room = RoomService.get(roomId);

    if (!room) {
        res.json({
            error: "Room doesn't exist",
        });
        return;
    }

    room.joinRequest(player);

    res.json({
        message: "Room join requested.",
    });
});

export default router;
