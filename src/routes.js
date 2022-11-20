import { Router } from "express";

import { Room, Player } from "./models/index.js";

const router = Router();

router.get("/room/exists/:roomId", (req, res) => {
    const { roomId } = req.params;
    res.json({
        roomId: roomId,
        exists: Room.exists(roomId),
    });
});

router.post("/room/join", (req, res) => {
    const { roomId, userId } = req.body;

    const player = Player.get(userId);
    const room = Room.get(room);

    if (!room) {
        res.json({
            error: "Room does not exist",
        });
        return;
    }

    room = room.addPlayer(player);
});

export default router;
