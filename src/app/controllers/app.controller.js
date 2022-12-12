import http from "http";
import express, { Router } from "express";
import { Socket } from "../../lib/Socket/index.js";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";
import PlayerClientMapper from "../helpers/playerClient.js";

import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import RoomController from "./room.controller.js";
import PlayerController from "./player.controller.js";

class AppController {
    constructor(services) {
        this.services = services;

        this.httpServer = http.createServer();
        this.socketServer = Socket.createServer({
            httpServer: this.httpServer,
            path: process.env.WEBSOCKET_CONNECTION_PATH,
        });

        this.services.pcm = new PlayerClientMapper(
            services.roomService,
            this.socketServer
        );

        const expressApp = express();
        expressApp.use(this.routes);

        this.httpServer.on("request", (req, res) => {
            // [Hack] let socket server handle the request on this path
            // to prevent response conflict caused by express
            if (req.url.startsWith(process.env.WEBSOCKET_CONNECTION_PATH))
                return;
            expressApp(req, res);
        });

        this.socketServer.on("connection", (client) => {
            client.emit("client-id", client.id);
        });
    }

    listen(port) {
        this.httpServer
            .on("listening", () => {
                console.log(`Server listening on http://127.0.0.1:${port}`);
            })
            .on("error", (err) => {
                console.log(`Server encountered error! ${err.message}`);
            })
            .listen(port);
    }

    get routes() {
        const router = new Router();

        // Middlewares
        router.use(helmet());
        router.use(cors());
        router.use(morgan("dev"));
        router.use(express.json());

        // Routes
        router.get("/", this.sayHi);

        // Other Controllers
        router.use("/api/player", new PlayerController(this.services).routes);
        router.use("/api/room", new RoomController(this.services).routes);
        // router.use("/api/chat", new ChatController(this.services).routes);
        // router.use("/api/game", new GameController(this.services).routes);

        // Not Found Handler
        router.use(this.routeNotFound);

        return router;
    }

    sayHi = controller(async (req, res) => {
        return httpStatus.OK("Scribbly says hi! 👋");
    });

    routeNotFound = controller(async (req, res) => {
        return httpStatus.NotFound(
            `You seem lost 😢. Requested resource '${req.path}' was not found.`
        );
    });
}

export default AppController;
