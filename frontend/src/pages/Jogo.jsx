import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import Board from "../components/Board";
import Stats from "../components/Stats";
import { gameService } from "../services/game/services";
import { io } from "socket.io-client";

function Jogo() {
  const { gameId } = useParams();

  const playerId = localStorage.getItem("playerId") || "id-do-jogador";
  const playerName = localStorage.getItem("playerName") || "Jogador";

  const initialBoard = Array(9)
    .fill(null)
    .map(() => Array(9).fill(""));

  const [game, setGame] = useState({
    board: initialBoard,
    status: "aguardando",
    players: [],
    maxTurnAt: null,
    winnerId: null,
    currentTurnPlayerId: null,
  });

  const [fixedCells, setFixedCells] = useState(
    initialBoard.map((row) => row.map(() => false))
  );

  const [accumulatedMoves, setAccumulatedMoves] = useState([]);
  const [notification, setNotification] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  const timerRef = useRef(null);
  const missDispatchedRef = useRef(false);
  const socketRef = useRef(null);
  const prevTurnRef = useRef(null);

  const gameRef = useRef(game);
  useEffect(() => {
    gameRef.current = game;
  }, [game]);

  const isMyTurn =
    game.currentTurnPlayerId === playerId && game.status === "playing";

  const showNotification = useCallback((type, text) => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  const dispatchMiss = useCallback(
    async (gId) => {
      if (missDispatchedRef.current) return;
      missDispatchedRef.current = true;
      try {
        await gameService.miss(gId, playerId);
      } catch {
        // silencioso — o game.updated vai chegar via websocket de qualquer forma
      }
    },
    [playerId]
  );

  const startTimer = useCallback(
    (maxTurnAt, currentTurnId, gId) => {
      clearInterval(timerRef.current);
      missDispatchedRef.current = false;

      if (!maxTurnAt) {
        setTimeLeft(null);
        return;
      }

      const update = () => {
        const diff = Math.max(
          0,
          Math.floor((new Date(maxTurnAt) - Date.now()) / 1000)
        );
        setTimeLeft(diff);

        if (diff === 0) {
          clearInterval(timerRef.current);
          if (currentTurnId !== playerId) {
            dispatchMiss(gId);
          }
        }
      };

      update();
      timerRef.current = setInterval(update, 1000);
    },
    [playerId, dispatchMiss]
  );

  const applyPayload = useCallback(
    (payload, options = {}) => {
      const { winnerId } = options;

      setGame((prev) => ({
        ...prev,
        board: payload.board ?? prev.board,
        status: payload.status ?? prev.status,
        players: payload.players ?? prev.players,
        maxTurnAt: payload.maxTurnAt ?? prev.maxTurnAt,
        currentTurnPlayerId:
          payload.currentTurnPlayerId ?? prev.currentTurnPlayerId,
        winnerId: winnerId ?? prev.winnerId,
      }));

      if (payload.board) {
        const fixed = payload.board.map((row) => row.map((cell) => cell !== ""));
        setFixedCells(fixed);
        setAccumulatedMoves([]);
      }

      if (payload.maxTurnAt) {
        startTimer(
          payload.maxTurnAt,
          payload.currentTurnPlayerId,
          payload.gameId
        );
      }
    },
    [startTimer]
  );

  const loadGrid = useCallback(async () => {
    try {
      const gameData = await gameService.find(gameId);
      const board = JSON.parse(gameData.tabuleiro);

      if (
        gameData.maxTurnAt &&
        new Date(gameData.maxTurnAt) < new Date() &&
        gameData.currentTurnPlayerId !== playerId &&
        gameData.status === "playing"
      ) {
        await dispatchMiss(gameId);
        return;
      }

      setGame((prev) => ({
        ...prev,
        board,
        status: gameData.status,
        players: gameData.players ?? prev.players,
        maxTurnAt: gameData.maxTurnAt ?? prev.maxTurnAt,
        currentTurnPlayerId:
          gameData.currentTurnPlayerId ?? prev.currentTurnPlayerId,
      }));

      const fixed = board.map((row) => row.map((cell) => cell !== ""));
      setFixedCells(fixed);
      setAccumulatedMoves([]);

      if (gameData.maxTurnAt) {
        startTimer(gameData.maxTurnAt, gameData.currentTurnPlayerId, gameId);
      }
    } catch {
      showNotification("error", "Erro ao recuperar partida");
    }
  }, [gameId, playerId, dispatchMiss, startTimer, showNotification]);

  useEffect(() => {
    if (gameId) loadGrid();
    return () => clearInterval(timerRef.current);
  }, [gameId]);

  useEffect(() => {
    if (!gameId) return;

    const socket = io("http://localhost:3001", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const doSubscribe = () => {
      socket.emit("subscribe", `game.${gameId}`);
    };

    if (socket.connected) {
      doSubscribe();
    } else {
      socket.once("connect", doSubscribe);
    }

    socket.on("reconnect", () => {
      doSubscribe();
      loadGrid();
    });

    const onGameUpdated = (payload) => {
      applyPayload(payload);
    };

    const onPlayerJoined = (payload) => {
      applyPayload(payload);
      const otherPlayer = payload.players?.find((p) => p.id !== playerId);
      showNotification(
        "info",
        otherPlayer
          ? `${otherPlayer.nome} entrou na partida!`
          : "Um jogador entrou na partida!"
      );
    };

    const onGameEnd = (payload) => {
      applyPayload(payload, { winnerId: payload.winnerId });
      clearInterval(timerRef.current);
      setTimeLeft(null);

      if (payload.winnerId === playerId) {
        showNotification("success", "🏆 Você venceu!");
      } else {
        const winner = payload.players?.find((p) => p.id === payload.winnerId);
        showNotification(
          "info",
          winner ? `${winner.nome} venceu a partida.` : "Partida encerrada."
        );
      }
    };

    socket.on("game.updated", onGameUpdated);
    socket.on("game.player.joined", onPlayerJoined);
    socket.on("game.end", onGameEnd);

    return () => {
      socket.off("connect", doSubscribe);
      socket.off("reconnect");
      socket.off("game.updated", onGameUpdated);
      socket.off("game.player.joined", onPlayerJoined);
      socket.off("game.end", onGameEnd);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [gameId]);

  useEffect(() => {
    if (
      game.currentTurnPlayerId === playerId &&
      prevTurnRef.current !== playerId
    ) {
      showNotification("success", "Sua vez! Faça suas jogadas e clique em Enviar.");
    }
    prevTurnRef.current = game.currentTurnPlayerId;
  }, [game.currentTurnPlayerId]);

  const handleChange = (row, col, value) => {
    if (!isMyTurn) return;
    if (fixedCells[row][col]) return;
    if (!/^[1-9]?$/.test(value)) return;

    const newBoard = game.board.map((r) => [...r]);
    newBoard[row][col] = value;
    setGame((prev) => ({ ...prev, board: newBoard }));

    setAccumulatedMoves((prev) => {
      const filtered = prev.filter((m) => !(m.row === row && m.col === col));
      return [...filtered, { row, col, value }];
    });
  };

  const handleSendMove = async () => {
    if (!isMyTurn) {
      showNotification("error", "Aguarde sua vez.");
      return;
    }
    if (accumulatedMoves.length === 0) {
      showNotification("error", "Faça ao menos uma jogada antes de enviar!");
      return;
    }

    try {
      const result = await gameService.playMoves(gameId, playerId, accumulatedMoves);

      if (result.success) {
        showNotification("success", "Jogadas enviadas!");
      } else {
        showNotification("error", `Jogada inválida: ${result.error}`);
      }

      if (result.game) {
        applyPayload(result.game);
      }

      setAccumulatedMoves([]);
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erro ao enviar a jogada para o servidor.";
      showNotification("error", message);
    }
  };

  const isFinished = game.status === "finished";
  const isWaiting = game.status === "aguardando";

  const myStats = game.players.find((p) => p.id === playerId);
  const opponentStats = game.players.find((p) => p.id !== playerId);

  return (
    <div className="container">
      <h1>Sudoku PvP</h1>
      <h2>ID da Partida: {gameId}</h2>
      <h3>Jogador: {playerName}</h3>

      {notification && (
        <div
          style={{
            padding: "10px 16px",
            marginBottom: "12px",
            borderRadius: "6px",
            fontWeight: 500,
            backgroundColor:
              notification.type === "success"
                ? "#d4edda"
                : notification.type === "error"
                ? "#f8d7da"
                : "#d1ecf1",
            color:
              notification.type === "success"
                ? "#155724"
                : notification.type === "error"
                ? "#721c24"
                : "#0c5460",
            border: `1px solid ${
              notification.type === "success"
                ? "#c3e6cb"
                : notification.type === "error"
                ? "#f5c6cb"
                : "#bee5eb"
            }`,
          }}
        >
          {notification.text}
        </div>
      )}

      {game.players.length > 0 && (
        <div style={{ display: "flex", gap: "16px", marginBottom: "12px" }}>
          {[myStats, opponentStats].filter(Boolean).map((p) => (
            <div
              key={p.id}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "5px",
                background: p.id === playerId ? "#e8f4fd" : "#f8f9fa",
                border: "1px solid #dee2e6",
                fontSize: "14px",
              }}
            >
              <strong>{p.id === playerId ? "Você" : p.nome}</strong>
              <span style={{ float: "right" }}>
                ❌ {p.erros} erros &nbsp; ✅ {p.jogadas} jogadas
              </span>
            </div>
          ))}
        </div>
      )}

      {isWaiting && (
        <p
          style={{
            color: "#856404",
            background: "#fff3cd",
            padding: "8px 12px",
            borderRadius: "5px",
          }}
        >
          ⏳ Aguardando outro jogador entrar...
        </p>
      )}

      {!isWaiting && !isFinished && (
        <p
          style={{
            background: isMyTurn ? "#d4edda" : "#e2e3e5",
            color: isMyTurn ? "#155724" : "#383d41",
            padding: "8px 12px",
            borderRadius: "5px",
            fontWeight: 500,
          }}
        >
          {isMyTurn ? "✏️ Sua vez de jogar" : "⏳ Aguardando o adversário..."}
          {timeLeft !== null && (
            <span style={{ float: "right", fontVariantNumeric: "tabular-nums" }}>
              ⏱ {timeLeft}s
            </span>
          )}
        </p>
      )}

      {isFinished && (
        <p
          style={{
            background: "#cce5ff",
            color: "#004085",
            padding: "8px 12px",
            borderRadius: "5px",
            fontWeight: 600,
          }}
        >
          {game.winnerId === playerId ? "🏆 Você venceu!" : "Partida encerrada."}
        </p>
      )}

      <Stats players={game.players} />

      <Board
        board={game.board}
        handleChange={handleChange}
        fixedCells={fixedCells}
        disabled={!isMyTurn || isFinished}
      />

      {!isFinished && (
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <button
            onClick={handleSendMove}
            disabled={!isMyTurn || accumulatedMoves.length === 0}
            style={{
              padding: "10px 20px",
              fontSize: "16px",
              cursor:
                isMyTurn && accumulatedMoves.length > 0
                  ? "pointer"
                  : "not-allowed",
              backgroundColor:
                isMyTurn && accumulatedMoves.length > 0 ? "#4CAF50" : "#aaa",
              color: "white",
              border: "none",
              borderRadius: "5px",
              transition: "background-color 0.2s",
            }}
          >
            Enviar Jogada{" "}
            {accumulatedMoves.length > 0 ? `(${accumulatedMoves.length})` : ""}
          </button>
        </div>
      )}
    </div>
  );
}

export default Jogo;