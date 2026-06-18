import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import Stats from "../components/Stats";
import { gameService } from "../services/game/services";
import { io } from "socket.io-client";
 const socket = io("http://localhost:3001");


function Jogo() {
  const { gameId } = useParams();

  const playerId = localStorage.getItem("playerId") || "id-do-jogador";
  const playerName = localStorage.getItem("playerName") || "Jogador";

  const initialBoard = [
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
    ["", "", "", "", "", "", "", "", ""],
  ];

  const [game, setGame] = useState({
    board: initialBoard,
    winner: null,
  });

  const [fixedCells, setFixedCells] = useState(
    initialBoard.map((row) => row.map(() => false))
  );

  // LISTA ACUMULADORA: Estado simples para guardar o array de jogadas da rodada
  const [accumulatedMoves, setAccumulatedMoves] = useState([]);

  async function loadGrid() {
    try {
      const gameData = await gameService.find(gameId);
      const board = JSON.parse(gameData.tabuleiro);
      
      setGame((e) => ({ ...e, board }));
      
      const cellsFromBackend = board.map((row) =>
        row.map((cell) => cell !== "")
      );
      setFixedCells(cellsFromBackend);
      setAccumulatedMoves([]);

    } catch (error) {
      alert("Erro ao recuperar partida");
    }
  }

  useEffect(() => {
    if (!!gameId && gameId !== "") {
      loadGrid();
    }
  }, [gameId]);

  const handleChange = (row, col, value) => {
    if (fixedCells[row][col]) return;
    if (!/^[1-9]?$/.test(value)) return;

    // 1. Atualiza o visual do tabuleiro na tela
    const newBoard = game.board.map((r) => [...r]);
    newBoard[row][col] = value;
    setGame({ ...game, board: newBoard });

    // 2. ACUMULA A JOGADA: Remove duplicatas da mesma célula (caso o usuário mude de ideia) e adiciona a nova
    setAccumulatedMoves((prev) => {
      const filtered = prev.filter((m) => !(m.row === row && m.col === col));
      return [...filtered, { row, col, value }];
    });
  };

  // FUNÇÃO DESTINADA APENAS PARA ENVIAR
  const handleSendMove = async () => {
    if (accumulatedMoves.length === 0) {
      alert("Faça ao menos uma jogada antes de enviar!");
      return;
    }

    try {
      const result = await gameService.playMoves(gameId, playerId, accumulatedMoves);

      if (result?.error) {
        alert(`Jogada inválida: ${result.error}`);
        await loadGrid();
      } else {
        alert("Jogadas enviadas com sucesso!");
        setAccumulatedMoves([]);
        
        if (result.tabuleiro) {
          setGame((e) => ({ ...e, board: JSON.parse(result.tabuleiro) }));
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro ao enviar a jogada para o servidor.";

      alert(message);
    }
  };

  
  useEffect(() => {
    if (!gameId) return;

    socket.emit("subscribe", `game.${gameId}`);

    const handleUpdate = (payload) => {
      console.log(payload);
    };

    socket.on("game.updated", handleUpdate);

    socket.on("game.player.joined", handleUpdate);

    if(!!playerId && playerId !== "")
      socket.on(`game.turn.${playerId}` , handleUpdate);

    socket.on("game.end", handleUpdate);

    return () => {
      socket.off("game.updated", handleUpdate);

      if (playerId) {
        socket.off(`game.turn.${playerId}`, handleUpdate);
      }

      socket.off("game.player.joined", handleUpdate);

      socket.off("game.end", handleUpdate);
    };
  }, [gameId,playerId]);

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

      <div style={{ marginTop: "20px", textAlign: "center" }}>
        <button 
          onClick={handleSendMove}
          className="btn-enviar"
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "5px"
          }}
        >
          Enviar Jogada
        </button>
      </div>
    </div>
  );
}

export default Jogo;