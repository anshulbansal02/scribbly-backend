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
}

export default PlayerClientMapper;
