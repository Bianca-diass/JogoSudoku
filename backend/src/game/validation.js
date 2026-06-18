export function isValidMove(board, row, col, value) {
  if (value === "") return true;

  // 🔴 1. checar linha
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === value) {
      return false;
    }
  }

  // 🔵 2. checar coluna
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === value) {
      return false;
    }
  }

  // 🟡 3. checar bloco 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[startRow + i][startCol + j] === value) {
        return false;
      }
    }
  }

  return true;
}