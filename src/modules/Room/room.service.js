import Room from "./models/Room.js";
import RoomWorker from "./room.worker.js";

class RoomService {
    constructor(store, broker) {
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
            this.worker.joinRequests.init(room.id),
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
        const playerRoomRel = await this.playerRelCollection.getRecord(
            playerId
        );

        if (playerRoomRel) {
            if (playerRoomRel.status === "requested") {
                this.cancelJoinRequest(playerId);
            }
        } else {
            await this.worker.joinRequests.addPlayer(roomId, playerId);
        }
    }

    async cancelJoinRequest(playerId) {
        await this.worker.joinRequests.removePlayer(playerId);
    }

    async leave(playerId) {
        const { roomId, status } =
            (await this.playerRelCollection.getRecord(playerId)) ?? {};

        if (status === "requested") return;

        if (roomId) {
            const playerIds = await this.roomCollection.getField(
                roomId,
                "playerIds"
            );
            playerIds.splice(playerIds.indexOf(playerId));

            const adminId = await this.roomCollection.getField(
                roomId,
                "adminId"
            );

            if (playerId === adminId) this.worker.electAdmin();

            await Promise.all([
                this.playerRelCollection.delRecord(playerId),
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
