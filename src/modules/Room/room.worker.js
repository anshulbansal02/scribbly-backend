import { randomInt } from "./../../utils";

class RoomWorker {
    constructor(store, broker) {
        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");
        this.requestsQueueCollection = store.collection("room_requests_queue");

        this.playerChannel = broker.subchannel("player");
        this.roomChannel = broker.subchannel("room");
    }

    joinRequests = {
        async add(roomId, playerId) {
            await this.requestsQueueCollection.listPush(roomId, playerId);
        },

        async remove(roomId, playerId) {},
    };

    async _electAdmin(roomId) {
        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );

        const adminId = playerIds[randomInt(0, playerIds.length - 1)];

        await this.roomCollection.setField(roomId, "adminId", adminId);
        await this.roomChannel.subchannel(roomId).emit("admin_elect", adminId);
    }

    async _addPlayer(roomId, playerId) {
        const playerIds = await this.roomCollection.getField(
            roomId,
            "playerIds"
        );
        playerIds.push(playerId);

        await Promise.all([
            this.playerRelCollection.setKey(playerId, roomId),
            this.roomCollection.setField(roomId, "playerIds", playerIds),
            this.roomChannel.subchannel(roomId).emit("player_join", playerId),
            this.playerChannel.subchannel(playerId).emit("room_join", roomId),
        ]);
    }

    _processJoinRequest = async (roomId) => {
        const playerId = await this.requestsQueueCollection.listIndex(
            roomId,
            0
        );

        const roomIsPrivate = await this.roomCollection.getField(
            roomId,
            "settings.isPrivate"
        );
        if (!roomIsPrivate) {
            this._addPlayer(roomId, playerId);
            await this.requestsQueueCollection.listLeftPop(roomId);
            setImmediate(() => this._processJoinRequest(roomId));
            return;
        }

        const adminChannel = this.playerChannel.subchannel(adminId);
        const playerChannel = this.playerChannel.subchannel(playerId);

        await adminChannel.emit("player_join_request", playerId);

        adminChannel.on(
            "player_join_response",
            async ({ playerId, approve }) => {
                if (approve) {
                    this._addPlayer(roomId, playerId);
                    await playerChannel.emit("join_response", {
                        playerId,
                        approve,
                    });
                }
            }
        );
    };
}

export default RoomWorker;
