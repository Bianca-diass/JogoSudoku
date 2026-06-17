import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import { initSocket } from "./sockets/socket.js";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

initSocket(io);

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});