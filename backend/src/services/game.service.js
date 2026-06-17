import { games } from "../game/gameState.js";
import { isValidMove } from "../game/validation.js";
import { checkWinner } from "../game/winCheck.js";

export function createGame(playerId) {
  const gameId = Date.now().toString();

  games[gameId] = {
    id: gameId,
    players: [playerId],
    board: Array(9).fill(null).map(() => Array(9).fill("")),
    turn: playerId,
    errors: {},
    finished: false,
    winner: null,
    lastPlayer: null,
    status: "waiting",
  };

  return gameId;
}

export function joinGame(gameId, playerId) {
  const game = games[gameId];

  if (!game) return { error: "Partida não existe" };
  if (game.players.length >= 2) return { error: "Partida cheia" };

  game.players.push(playerId);
  game.errors[playerId] = 0;

  if (game.players.length === 2) {
    game.status = "playing";
  }

  return game;
}

export function playMove(gameId, playerId, row, col, value) {
  const game = games[gameId];

  if (!game) return { error: "Partida não existe" };
  if (game.finished) return { error: "Partida finalizada" };
  if (game.status !== "playing") return { error: "Aguardando jogador" };

  if (game.turn !== playerId) return { error: "Não é sua vez" };

  if (game.board[row][col] !== "") {
    return { error: "Célula já preenchida" };
  }

  const valid = isValidMove(game.board, row, col, value);

  if (!valid) {
    game.errors[playerId] = (game.errors[playerId] || 0) + 1;
    return { error: "Jogada inválida" };
  }

  game.board[row][col] = value;
  game.lastPlayer = playerId;

  const result = checkWinner(game);

  if (result) {
    game.finished = true;
    game.winner = result.winner;

    return game;
  }

  const nextPlayer = game.players.find(p => p !== playerId);
  game.turn = nextPlayer;

  return game;
}