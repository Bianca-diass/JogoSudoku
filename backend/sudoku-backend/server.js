const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const rooms = {};

io.on("connection", (socket) => {

  console.log("Usuário conectado");

  socket.on("createRoom", () => {

    const roomId = Math.random()
      .toString(36)
      .substring(2, 7)
      .toUpperCase();

    rooms[roomId] = {
      players: [],
    };

    console.log("Sala criada:", roomId);

    socket.emit("roomCreated", roomId);
  });

});

server.listen(3001, () => {
  console.log("Servidor rodando na porta 3001");
});
