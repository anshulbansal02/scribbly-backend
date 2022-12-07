import Chat from "./models/Chat.js";
import ChatMessage from "./models/ChatMessage.js";

class ChatService {
    constructor(store, mainChannel) {
        if (ChatService._instance) {
            throw new Error("ChatService is already initialized");
        }
        ChatService._instance = this;

        this.playerChannel = mainChannel.subchannel("player");
        this.roomChannel = mainChannel.subchannel("room");

        this.roomCollection = store.collection("room");
        this.playerRelCollection = store.collection("player_room_map");

        this.worker = new RoomWorker(store, mainChannel);
    }

    static get service() {
        if (!ChatService._instance)
            throw new Error("ChatService is not initialized");
        return ChatService._instance;
    }

    async create(adminPlayerId) {
        const room = new Room(adminPlayerId, [adminPlayerId]);

        await Promise.all([
            this.roomCollection.setRecord(room),
            this.playerRelCollection.setRecord({
                id: adminPlayerId,
                roomId: room.id,
                status: "joined",
            }),

            this.worker.joinRequests.init(room.id),
            this.roomChannel.emit("create", room),
        ]);

        return room;
    }

    async get(roomId) {
        return await this.roomCollection.getRecord(roomId);
    }
}

export default ChatService;
