import { createServer } from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import { Server as SocketServer } from "socket.io";

import registerSocketHandlers from "./io/index.js";

import dotenv from "dotenv";
dotenv.config();

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
