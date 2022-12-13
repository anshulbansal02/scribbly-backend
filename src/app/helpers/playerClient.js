import controller from "./controller.js";
import httpStatus from "./httpStatus.js";

class PlayerClientMapper {
    constructor(roomService, socketServer) {
        this.playerToClientMap = new Map();
        this.clientToPlayerMap = new Map();
        this.roomService = roomService;
        this.socketServer = socketServer;
    }

    associate(playerId, clientId) {
        this.playerToClientMap.set(playerId, clientId);
        this.clientToPlayerMap.set(clientId, playerId);
    }

    getPlayer(clientId) {
        return this.clientToPlayerMap.get(clientId);
    }

    getClient(playerId) {
        return this.playerToClientMap.get(playerId);
    }

    async broadcastToRoom(roomId, event, data) {
        const playerIds = (await this.roomService.getPlayerIds(roomId)) ?? [];
        for (const playerId of playerIds) {
            this.emitToPlayer(playerId, event, data);
        }
    }

    emitToPlayer(playerId, event, data) {
        const client = this.socketServer.getClient(
            playerToClientMap.get(playerId)
        );
        if (client) client.emit(event, data);
    }

    middleware = {
        clientRequired: controller((req, res, next) => {
            const clientId = req.header("Client-Id");
            if (!clientId) {
                return httpStatus.BadRequest("Client-Id header missing");
            }
            req.client = this.socketServer.getClient(clientId);
            if (!req.client) {
                return httpStatus.BadRequest("Invalid Client-Id");
            }
            return next();
        }),

        playerRequired: controller((req, res, next) => {
            req.playerId = this.clientToPlayerMap.get(req.client?.id);
            if (!req.playerId)
                return httpStatus.Unauthorized(
                    "Player not found. Client unauthorized"
                );
            next();
        }),
    };
}

export default PlayerClientMapper;
