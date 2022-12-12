import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

import { clientRequired, playerRequired } from "../middlewares/middlewares.js";

class RoomController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;

        this.eventExchange(services.eventChannel, services.ss);
    }

    eventExchange(eventChannel, ss) {
        const roomChannel = eventChannel.subchannel("room");

        roomChannel.on("player_joined", async (playerId, subchannels) => {
            const roomId = subchannels[2];
            await ss.broadcastToRoom(roomId, "player_joined", playerId);
        });

        roomChannel.on("player_left", async (playerId, subchannels) => {
            const roomId = subchannels[2];
            await ss.broadcastToRoom(roomId, "player_left", playerId);
        });

        roomChannel.on(
            "player_join_response",
            ({ playerId, approval }, subchannels) => {
                const roomId = subchannels[2];
                ss.emitToPlayer(playerId, "player_join_response", {
                    roomId,
                    approval,
                });
            }
        );
    }

    get routes() {
        const router = new Router();

        router.use(clientRequired);
        router.use(playerRequired);

        router.post("/create", this.createRoom);
        router.post("/join/:roomId", this.joinRoom);
        router.post("/leave", this.leaveRoom);
        router.post("/cancel-join", this.cancelJoin);
        router.get("/:roomId", this.getRoom);

        return router;
    }

    createRoom = controller(async (req, res) => {
        const playerRoomId = await this.roomService.getPlayerRoomId(playerId);
        if (playerRoomId) {
            return httpStatus.BadRequest(
                `Player already in room with Id ${playerRoomId}`
            );
        }

        const playerId = req.playerId;

        const room = await this.roomService.create(playerId);

        return httpStatus.Created(room);
    });

    joinRoom = controller(async (req, res) => {
        const playerRoomId = await this.roomService.getPlayerRoomId(playerId);
        if (playerRoomId) {
            return httpStatus.BadRequest(
                `Player already in room with Id ${playerRoomId}`
            );
        }

        const playerId = req.playerId;
        const { roomId } = req.params;

        await this.roomService.joinRequest(roomId, playerId);

        return httpStatus.Accepted();
    });

    cancelJoin = controller(async (req, res) => {
        await this.roomService.cancelJoinRequest(req.playerId);

        return httpStatus.Accepted();
    });

    leaveRoom = controller(async (req, res) => {
        if (!(await this.roomService.getPlayerRoomId(req.playerId)))
            return httpStatus.BadRequest("Player is not in room");

        await this.roomService.leave(req.playerId);

        return httpStatus.OK();
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
