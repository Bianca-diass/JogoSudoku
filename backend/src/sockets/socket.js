import { games } from "../game/gameState.js";
import { playMove } from "../services/game.service.js";
import { startGameTimer } from "../game/timer.js";

export function initSocket(io) {
  io.on("connection", (socket) => {

    socket.on("createGame", ({ gameId }) => {
      socket.join(gameId);
    });

    socket.on("joinGame", ({ gameId, playerId }) => {
      socket.join(gameId);

      const game = games[gameId];
      if (!game) return;

      if (game.players.length === 2 && !game.timerStarted) {
        game.timerStarted = true;
        game.status = "playing";
        startGameTimer(io, gameId);
      }

      io.to(gameId).emit("gameUpdate", game);
    });

    socket.on("move", ({ gameId, playerId, row, col, value }) => {

      const result = playMove(
        gameId,
        playerId,
        row,
        col,
        value
      );

      if (result.error) {
        socket.emit("moveError", result.error);
        return;
      }

      io.to(gameId).emit("gameUpdate", result);

      if (result.finished) {
        io.to(gameId).emit("gameFinished", {
          winner: result.winner,
          errors: result.errors,
          board: result.board,
        });
      } else {
        io.to(gameId).emit("turnChanged", {
          newTurn: result.turn,
        });
      }

    });

    socket.on("disconnect", () => {});
  });
}