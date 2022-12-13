import { Router } from "express";
import jwt from "jsonwebtoken";

import controller from "./../helpers/controller.js";
import httpStatus from "../helpers/httpStatus.js";

class PlayerController {
    constructor(services) {
        this.playerService = services.playerService;
        this.roomService = services.roomService;
        this.pcm = services.pcm;
    }

    get routes() {
        const router = new Router();

        router.use(this.pcm.middleware.clientRequired);

        router.post("/create", this.createPlayer);
        router.patch("/reassociate", this.reassociatePlayer);
        router.get("/:playerId", this.getPlayer);

        return router;
    }

    createPlayer = controller(async (req, res) => {
        const { username } = req.body;

        const associatedPlayerId = this.pcm.getPlayer(req.client.id);
        if (associatedPlayerId) {
            return httpStatus.BadRequest({
                playerId: associatedPlayerId,
                error: "A player is already associated to this client",
            });
        }

        const player = await this.playerService.create(username);

        const token = this.createAssociationToken(player.id, req.client.id);
        this.pcm.associate(player.id, req.client.id);

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
            const newToken = this.createAssociationToken(
                player.id,
                req.client.id
            );
            this.pcm.associate(player.id, req.client.id);
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
            : httpStatus.NotFound(
                  `Player with Id '${playerId}' does not exist`
              );
    });

    createAssociationToken(playerId, clientId) {
        return jwt.sign(
            {
                playerId,
                clientId,
            },
            process.env.SECRET_KEY
        );
    }
}

export default PlayerController;
