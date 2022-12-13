import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

class RoomController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
        this.pcm = services.pcm;

        this.eventExchange(services.eventChannel, services.pcm);
    }

    eventExchange(eventChannel, pcm) {
        const roomChannel = eventChannel.subchannel("room");
        const IRE = this.roomService.events;

        roomChannel.on(
            IRE.PLAYER_JOIN_REQUEST,
            async (playerId, subchannels) => {
                const roomId = subchannels[2];

                const adminId = await this.roomService.getAdminId(roomId);
                const player = await this.playerService.get(playerId);

                pcm.emitToPlayer(adminId, "player_join_request", player);
            }
        );

        roomChannel.on(
            IRE.PLAYER_JOIN_RESPONSE,
            ({ playerId, approval }, subchannels) => {
                const roomId = subchannels[2];
                pcm.emitToPlayer(playerId, "player_join_response", {
                    roomId,
                    approval,
                });
            }
        );

        roomChannel.on(IRE.PLAYER_JOINED, async (playerId, subchannels) => {
            const roomId = subchannels[2];
            await pcm.broadcastToRoom(roomId, "player_joined", playerId);
        });

        roomChannel.on(IRE.PLAYER_LEFT, async (playerId, subchannels) => {
            const roomId = subchannels[2];
            await pcm.broadcastToRoom(roomId, "player_left", playerId);
        });
    }

    get routes() {
        const router = new Router();

        const { clientRequired, playerRequired } = this.pcm.middleware;

        router.post("/create", clientRequired, playerRequired, this.createRoom);
        router.post(
            "/join/:roomId",
            clientRequired,
            playerRequired,
            this.joinRoom
        );
        router.post("/leave", clientRequired, playerRequired, this.leaveRoom);
        router.post(
            "/cancel-join",
            clientRequired,
            playerRequired,
            this.cancelJoin
        );
        router.get("/:roomId", clientRequired, playerRequired, this.getRoom);
        router.get("/exists/:roomId", this.roomExists);

        return router;
    }

    createRoom = controller(async (req, res) => {
        const { playerId } = req;

        const playerRoomId = await this.roomService.getPlayerRoomId(playerId);
        if (playerRoomId) {
            return httpStatus.BadRequest({
                roomId: playerRoomId,
                error: "Player already in a room",
            });
        }

        const room = await this.roomService.create(playerId);

        return httpStatus.Created(room);
    });

    joinRoom = controller(async (req, res) => {
        const { playerId } = req;

        const playerRoomId = await this.roomService.getPlayerRoomId(playerId);
        if (playerRoomId) {
            return httpStatus.BadRequest({
                roomId: playerRoomId,
                error: "Player already in a room",
            });
        }

        const { roomId } = req.params;
        if (!(await this.roomService.exists(roomId))) {
            return httpStatus.BadRequest(`Room does not exist`);
        }

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

    roomExists = controller(async (req, res) => {
        const { roomId } = req.params;
        const exists = await this.roomService.exists(roomId);
        return httpStatus.OK(exists);
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
