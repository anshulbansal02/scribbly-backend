import express, { Router } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import { Server as SocketServer } from "socket.io";
import registerSocketConnections from "../lib/Socket/index.js";

import PlayerController from "./player.controller.js";
import RoomController from "./room.controller.js";
import controller from "./index.js";

class AppController {
    constructor(httpServer, services) {
        const app = express();

        app.use(helmet());
        app.use(cors());
        app.use(morgan("dev"));
        app.use(express.json());

        app.use("/", this.routes);
        app.use("/api/player", new PlayerController(services).routes);
        app.use("/api/room", new RoomController(services).routes);

        httpServer.on("request", app);
        registerSocketConnections(
            new SocketServer(httpServer, {
                path: "/client-connect",
            })
        );

        return app;
    }

    get routes() {
        const router = new Router();

        router.get(
            "/",
            controller((req, res) => {
                return { message: "Scribbly says hi! 👋" };
            })
        );

        return router;
    }
}

export default AppController;
