import { Router } from "express";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

class ChatController {
    constructor(services) {
        this.roomService = services.roomService;
        this.chatService = services.chatService;
        this.pcm = services.pcm;

        this.eventExchange(services.eventChannel, services.pcm);
    }

    eventExchange(eventChannel, pcm) {
        const chatChannel = eventChannel.subchannel("chat");
        const ICE = this.chatService.events;

        pcm.socketServer.on("chat_message", async (client, message) => {
            const { playerId } = client;
            const roomId = await this.roomService.getPlayerRoomId(playerId);
            await this.chatService.newMessage(roomId, playerId, message);
        });

        chatChannel.on(ICE.CHAT_MESSAGE, async (message, subchannels) => {
            const roomId = subchannels[2];
            await this.pcm.broadcastToRoom("chat_message", message);
        });
    }

    get routes() {
        const router = new Router();

        return router;
    }
}

export default ChatController;
