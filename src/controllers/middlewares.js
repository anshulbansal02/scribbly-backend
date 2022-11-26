import Client from "./../lib/Socket/Client.js";

function clientRequired(req, res, next) {
    const clientId = req.header("Client-Id");
    if (!clientId) {
        return res.json({
            error: "Client-Id header missing",
        });
    }
    req.client = Client.get(clientId);
    if (!req.client) {
        return res.json({
            error: "Invalid Client-Id",
        });
    }
    next();
}

function playerRequired(req, res, next) {
    if (req.client && req.client.playerId) {
        req.playerId = req.client.playerId;
    } else {
        return res.json({
            error: "Player required",
        });
    }
    next();
}

export { clientRequired, playerRequired };
