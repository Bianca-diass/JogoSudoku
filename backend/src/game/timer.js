import { games } from "./gameState.js";

const TURN_TIME = 60; // 60 segundos

export function startGameTimer(io, gameId) {
  const game = games[gameId];

  if (!game) return;

  // evita múltiplos timers
  if (game.timerInterval) {
    clearInterval(game.timerInterval);
  }

  game.timeLeft = TURN_TIME;

  game.timerInterval = setInterval(() => {
    if (!games[gameId]) return;

    const game = games[gameId];

    if (game.finished) {
      clearInterval(game.timerInterval);
      return;
    }

    game.timeLeft -= 1;

    // 🔥 envia tempo para os jogadores
    io.to(gameId).emit("timerUpdate", {
      gameId,
      timeLeft: game.timeLeft,
      turn: game.turn,
    });

    // ⛔ acabou o tempo
    if (game.timeLeft <= 0) {
      const nextPlayer = game.players.find(p => p !== game.turn);

      game.turn = nextPlayer;
      game.timeLeft = TURN_TIME;

      io.to(gameId).emit("turnChanged", {
        gameId,
        newTurn: nextPlayer,
      });
    }
  }, 1000);
}