import Client from "./Client.js";

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

export default clientRequired;
