import { createServer } from "http";
import express, { Router } from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

import PlayerController from "./player.controller.js";
import RoomController from "./room.controller.js";

class AppController {
    constructor(services) {
        this.services = services;

        this.expressApp = express();
        this.expressApp.use(this.routes);
    }

    listen(port) {
        const httpServer = createServer(this.expressApp);

        httpServer
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
