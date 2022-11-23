class RoomService {
    static bootstrap(store, broker) {
        // Singleton
        if (RoomService._instance) {
            return RoomService._instance;
        }
        RoomService._instance = this;

        this.playerChannel = broker.channel("player");
        this.roomChannel = broker.channel("room");
        this.store = store;

        this._subscribeToUpdates();
    }

    static get service() {
        if (!RoomService._instance)
            throw new Error("RoomService is not initialized");
        return RoomService._instance;
    }

    _subscribeToUpdates() {}

    async create(adminId) {
        const room = new Room();
        room.adminId = adminId;
        TaskQueueWorker.create(
            `join_requests:${room.id}`,
            this.processJoinRequest
        );

        await this.store.set(room.id, room);
        this.roomChannel.emit("create", room);
        return room;
    }

    async get(roomId) {
        return await this.store.get(roomId);
    }

    async _electAdmin(roomId, playerId) {
        const room = await this.get(roomId);
        // randomly select one playerId and make that player admin
        let adminId;

        this.roomChannel.topic(roomId).emit("admin_elect", { adminId });

        (await TaskQueueWorker.get(`room_join_requests:${roomId}`)).reprocess();
    }

    async joinRequest(roomId, playerId) {
        (await TaskQueueWorker.get(`room_join_requests:${roomId}`)).enqueue(
            JSON.stringify({
                roomId,
                playerId,
            })
        );
    }

    async cancelJoinRequest(playerId) {
        // get room id from requests repo for current playerId
        const room = await this.get(roomId);

        if (room.settings.private) {
            this.playerChannel
                .topic(room.adminId)
                .emit("player_join_request_cancel", { playerId });
        }

        (await TaskQueueWorker.get(`room_join_requests:${roomId}`)).dequeue(
            JSON.stringify({
                roomId,
                playerId,
            })
        );
    }

    async leave(roomId, playerId) {
        const room = await this.get(roomId);
        if (room && room.playerIds.has(playerId)) {
            this._removePlayer(roomId, playerId);
            if (playerId === room.adminPlayerId) this._electAdmin();
        }
    }

    async _processJoinRequest({ roomId, playerId }) {
        const room = roomService.get(roomId);
        const adminTopic = broker.channel("player").topic(room.adminPlayerId);
        const playerTopic = broker.channel("player").topic(playerId);

        adminTopic.off("player_join_request");

        if (!room.settings.private) {
            roomService._addPlayer(room.id, playerId);
        }

        adminTopic.emit("player_join_request", { playerId });

        return new Promise((resolve) => {
            adminTopic.once("player_join_response", ({ playerId, approve }) => {
                if (approve) {
                    roomService._addPlayer(room.id, playerId);
                }
                playerTopic.emit("join_response", { playerId, approve });
                resolve();
            });
        });
    }

    async _addPlayer(roomId, playerId) {
        const room = await this.get(roomId);
        room.playerIds.add(playerId);
        // save back

        this.roomChannel.topic(roomId).emit("player_join", { playerId });
        this.playerChannel.topic(playerId).emit("room_join", { roomId });
    }

    async _removePlayer(roomId, playerId) {
        const room = await this.get(roomId);
        room.playerIds.delete(playerId);
        // save back

        this.roomChannel.topic(roomId).emit("player_leave", { playerId });
        this.playerChannel.topic(playerId).emit("room_leave", { roomId });
    }
}

export default RoomService;
