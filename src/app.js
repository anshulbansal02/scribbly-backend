const { createServer } = require("http");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { Server: SocketServer } = require("socket.io");

const registerSocketHandlers = require("./io/index");

require("dotenv").config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

const httpServer = createServer(app);
const io = new SocketServer(httpServer, { cors: { origin: "*" } });

registerSocketHandlers(io);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT);
httpServer.on("listening", () => {
    console.log(`Server listening on http://127.0.0.1:${PORT}`);
});
httpServer.on("error", (err) => {
    console.log(`Server encountered error! ${err.message}`);
});
