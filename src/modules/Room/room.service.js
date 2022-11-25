import Room from "./models/Room.js";
import RoomWorker from "./room.worker.js";

class RoomService {
    static bootstrap(store, broker) {
        if (RoomService._instance) {
            throw new Error("RoomService is already initialized");
        }
        RoomService._instance = this;

        this.playerChannel = broker.subchannel("player");
        this.roomChannel = broker.subchannel("room");

        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");

        this.worker = new RoomWorker(store, broker);
    }

    static get service() {
        if (!RoomService._instance)
            throw new Error("RoomService is not initialized");
        return RoomService._instance;
    }

    async create(adminPlayerId) {
        const room = new Room();
        room.admin = adminId;

        await Promise.all([
            this.roomCollection.saveRecord(room),
            this.playerRelCollection.setKey(adminPlayerId, room.id),
            this.roomChannel.emit("create", room),
        ]);

        return room;
    }

    async get(roomId) {
        return await this.roomCollection.getRecord(roomId);
    }

    async getPlayerRoom(playerId) {
        return await this.playerRelCollection.getKey(playerId);
    }

    async joinRequest(roomId, playerId) {
        await this.worker.joinRequests.addPlayer(roomId, playerId);
    }

    async cancelJoinRequest(playerId) {
        await this.worker.joinRequests.removePlayer(playerId);
    }

    async leave(playerId) {
        const roomId = await this.playerRelCollection.getKey(playerId);

        if (roomId) {
            const playerIds = await this.roomCollection.getField(
                roomId,
                "playerIds"
            );
            playerIds.splice(playerIds.indexOf(playerId));

            await Promise.all([
                this.playerRelCollection.delKey(playerId),
                this.roomCollection.setField(roomId, "playerIds", playerIds),

                this.roomChannel
                    .subchannel(roomId)
                    .emit("player_leave", playerId),
                this.playerChannel
                    .subchannel(playerId)
                    .emit("room_leave", roomId),
            ]);
        }
    }
}

export default RoomService;
