import Client from "../../lib/Socket/Client.js";

import httpStatus from "../helpers/httpStatus.js";
import controller from "../helpers/controller.js";

const clientRequired = controller((req, res, next) => {
    const clientId = req.header("Client-Id");
    if (!clientId) {
        return httpStatus.BadRequest("Client-Id header missing");
    }
    req.client = Client.get(clientId);
    if (!req.client) {
        return httpStatus.BadRequest("Invalid Client-Id");
    }
    return next();
});

const playerRequired = controller((req, res, next) => {
    if (req.client && req.client.playerId) {
        req.playerId = req.client.playerId;
    } else {
        return httpStatus.Unauthorized();
    }
    return next();
});

export { clientRequired, playerRequired };
