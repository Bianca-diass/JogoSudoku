export function isBoardComplete(board) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (board[row][col] === "") {
        return false;
      }
    }
  }
  return true;
}

export function checkWinner(game) {
  // se o tabuleiro está completo
  const complete = isBoardComplete(game.board);

  if (!complete) return null;

  // aqui você define regras de vitória
  // (simples: quem fez a última jogada vence)

  return {
    winner: game.lastPlayer,
    reason: "completed"
  };
}