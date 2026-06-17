import MoveService from "../services/move.service.js";

export default function gameSocket(io, socket) {

  socket.on("joinGame", async (data) => {

    const room = `game-${data.gameId}`;

    socket.join(room);

    io.to(room).emit("playerJoined", {
      playerId: data.playerId,
    });

    console.log(
      `Jogador ${data.playerId} entrou na sala ${room}`
    );
  });

  socket.on("playMove", async (data) => {

    const result = await MoveService.validate(data);

    if (!result.valid) {
      socket.emit("moveValidated", result);
      return;
    }

    io.to(`game-${data.gameId}`).emit(
      "moveValidated",
      result
    );

    io.to(`game-${data.gameId}`).emit(
      "turnChanged",
      {
        currentPlayer: result.nextPlayer,
      }
    );
  });

  socket.on("disconnect", () => {
    console.log("Jogador desconectado:", socket.id);
  });

}