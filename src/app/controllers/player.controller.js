import { Router } from "express";
import jwt from "jsonwebtoken";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

import { clientRequired } from "../middlewares/middlewares.js";

class PlayerController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
        this.playerClientMapper = services.ss;
    }

    get routes() {
        const router = new Router();

        router.use(clientRequired);
        router.post("/create", this.createPlayer);
        router.patch("/reassociate", this.reassociatePlayer);
        router.get("/:playerId", this.getPlayer);

        return router;
    }

    createPlayer = controller(async (req, res) => {
        const { username } = req.body;
        const player = await this.playerService.create(username);

        const token = this.createAssociationToken();
        this.playerClientMapper.associate(player.id, req.client.id);

        return httpStatus.Created({
            player,
            token,
        });
    });

    reassociatePlayer = controller(async (req, res) => {
        const { associationToken } = req.body;

        if (
            associationToken &&
            jwt.verify(associationToken, process.env.SECRET_KEY)
        ) {
            const newToken = this.createAssociationToken();
            this.playerClientMapper.associate(player.id, req.client.id);
            return httpStatus.OK({ token: newToken });
        } else {
            return httpStatus.Unauthorized();
        }
    });

    getPlayer = controller(async (req, res) => {
        const { playerId } = req.params;
        const player = await this.playerService.get(playerId);
        return player
            ? httpStatus.OK(player)
            : httpStatus.NotFound(`Player with Id ${playerId} does not exist`);
    });

    createAssociationToken(playerId, clientId) {
        return jwt.sign({
            playerId,
            clientId,
        });
    }
}

export default PlayerController;
