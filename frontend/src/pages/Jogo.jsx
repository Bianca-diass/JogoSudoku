import { useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import Stats from "../components/Stats";

function Jogo() {

  const { gameId } = useParams();

  const playerName =
    localStorage.getItem("playerName") ||
    "Jogador";

  const initialBoard = [
    ["5", "", "", "", "7", "", "", "", ""],
    ["6", "", "", "1", "9", "5", "", "", ""],
    ["", "9", "8", "", "", "", "", "6", ""],
    ["8", "", "", "", "6", "", "", "", "3"],
    ["4", "", "", "8", "", "3", "", "", "1"],
    ["7", "", "", "", "2", "", "", "", "6"],
    ["", "6", "", "", "", "", "2", "8", ""],
    ["", "", "", "4", "1", "9", "", "", "5"],
    ["", "", "", "", "8", "", "", "7", "9"],
  ];

  const fixedCells = initialBoard.map((row) =>
    row.map((cell) => cell !== "")
  );

  const [game, setGame] = useState({
    board: initialBoard,
    winner: null,
  });

  const handleChange = (row, col, value) => {

    if (fixedCells[row][col]) return;

    if (!/^[1-9]?$/.test(value)) return;

    const newBoard =
      game.board.map((r) => [...r]);

    newBoard[row][col] = value;

    setGame({
      ...game,
      board: newBoard,
    });
  };

  return (
    <div className="container">

      <h1>Sudoku PvP</h1>

      <h2>ID da Partida: {gameId}</h2>

      <h3>Jogador: {playerName}</h3>

      <Stats />

      <Board
        board={game.board}
        handleChange={handleChange}
        fixedCells={fixedCells}
      />

    </div>
  );
}

export default Jogo;