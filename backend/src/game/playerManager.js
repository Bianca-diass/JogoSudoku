import { games } from "./gameState.js";

export function assignPlayer(game) {
  const p1 = game.players[0];
  const p2 = game.players[1];

  return {
    player1: p1,
    player2: p2,
  };
}