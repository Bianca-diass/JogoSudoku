import { isValidMove } from "../game/validation.js";
import { starters } from "../helper/starters.js";
import { prisma } from "../lib/prisma.js";
import { winCheck } from "../game/winCheck.js";
import { broadcast } from "../sockets/socket.js";

function getNumberFromDate(date = new Date()) {
  const ms = new Date(date).getTime();
  return ms % 9;
}

function buildGamePayload(game) {
  return {
    gameId: game.id,
    status: game.status,
    board: JSON.parse(game.tabuleiro),
    maxTurnAt: game.maxTurnAt?.toISOString() ?? null,
    currentTurnPlayerId: game.lastPlayerId
      ? game.jogadores.find((j) => j.jogadorId !== game.lastPlayerId)?.jogadorId ?? null
      : game.jogadores[0]?.jogadorId ?? null,
    players: game.jogadores.map((item) => ({
      id: item.jogador.id,
      nome: item.jogador.nome,
      pontos: item.jogador.pontos,
      erros: item.erros,
      jogadas: item.jogadas,
    })),
  };
}

function createTurnDeadline(seconds = 60) {
  return new Date(Date.now() + seconds * 1000);
}

async function invalidateMove(gameId, player, errorMessage) {
  await prisma.jogadorPartida.update({
    where: { id: player.id },
    data: { erros: { increment: 1 } },
  });

  const updatedGame = await prisma.partida.update({
    where: { id: gameId },
    data: {
      lastPlayerId: player.jogadorId,
      maxTurnAt: createTurnDeadline(60),
    },
    include: {
      jogadores: { include: { jogador: true } },
    },
  });

  const payload = buildGamePayload(updatedGame);

  broadcast.game(gameId, "game.updated", payload);

  return { success: false, error: errorMessage, game: payload };
}

export const gameService = {
  async getGame(gameId) {
    const game = await prisma.partida.findFirst({
      where: { id: gameId },
    });

    if (!game) {
      return { error: "Partida não encontrada" };
    }

    return game;
  },

  async createGame(playerId) {
    const loadedGame = starters[9];

    const partida = await prisma.partida.create({
      data: {
        status: "aguardando",
        tabuleiro: JSON.stringify(loadedGame.tabuleiro),
      },
    });

    await prisma.jogadorPartida.create({
      data: {
        jogadorId: playerId,
        partidaId: partida.id,
        erros: 0,
        jogadas: 0,
      },
    });

    return partida;
  },

  async joinGame(gameId, playerId) {
    const game = await prisma.partida.findUnique({
      where: { id: gameId },
      include: {
        jogadores: true,
      },
    });

    if (!game) {
      return { error: "Partida não existe" };
    }

    if (game.jogadores.length >= 2) {
      return { error: "Partida cheia" };
    }

    if (game.jogadores.some((p) => p.jogadorId === playerId)) {
      return { error: "Jogador já está na partida" };
    }

    const shouldStart = game.jogadores.length === 1;

    await prisma.jogadorPartida.create({
      data: {
        partidaId: gameId,
        jogadorId: playerId,
      },
    });

    const turnDeadline = createTurnDeadline(60);

    const updatedGame = await prisma.partida.update({
      where: { id: gameId },
      data: shouldStart
        ? {
            status: "playing",
            maxTurnAt: turnDeadline,
          }
        : {},
      include: {
        jogadores: {
          include: { jogador: true },
        },
      },
    });

    const payload = buildGamePayload(updatedGame);

    broadcast.game(gameId, "game.player.joined", payload);

    if (shouldStart) {
      broadcast.game(gameId, "game.updated", payload);
    }

    return updatedGame;
  },

  async playMoves(gameId, playerId, moves) {
    const game = await prisma.partida.findFirst({
      where: { id: gameId },
      include: {
        jogadores: {
          include: { jogador: true },
        },
      },
    });

    if (!game) {
      return { error: "Partida não existe" };
    }

    if (game.status !== "playing" || game.jogadores.length !== 2) {
      return { error: "Aguardando jogador" };
    }

    const player = game.jogadores.find((item) => item.jogadorId === playerId);

    if (!player) {
      return { error: "Jogador não pertence à partida" };
    }

    if (game.lastPlayerId === playerId) {
      return { error: "Não é sua vez" };
    }

    if (!Array.isArray(moves) || moves.length === 0) {
      return { error: "Nenhum movimento enviado" };
    }

    const tempBoard = JSON.parse(game.tabuleiro);

    for (const move of moves) {
      const { row, col, value } = move;

      if (value === "") {
        continue;
      }

      if (tempBoard[row][col] !== "") {
        return invalidateMove(
          gameId,
          player,
          `Jogada inválida na posição [${row}][${col}]: Célula já preenchida.`
        );
      }

      const valid = isValidMove(tempBoard, row, col, value);

      if (!valid) {
        return invalidateMove(
          gameId,
          player,
          `Jogada inválida na posição [${row}][${col}]: Quebra as regras do Sudoku.`
        );
      }

      tempBoard[row][col] = value;
    }

    const totalJogadasSucedidas = moves.filter((m) => m.value !== "").length;

    await prisma.jogadorPartida.update({
      where: { id: player.id },
      data: {
        jogadas: { increment: totalJogadasSucedidas },
      },
    });

    const complete = winCheck.isBoardComplete(tempBoard);

    const updatedGame = await prisma.partida.update({
      where: { id: gameId },
      data: {
        tabuleiro: JSON.stringify(tempBoard),
        lastPlayerId: playerId,
        status: complete ? "finished" : "playing",
        maxTurnAt: complete ? null : createTurnDeadline(60),
      },
      include: {
        jogadores: {
          include: { jogador: true },
        },
      },
    });

    const payload = buildGamePayload(updatedGame);

    broadcast.game(gameId, "game.updated", payload);

    if (complete) {
      broadcast.game(gameId, "game.end", {
        ...payload,
        winnerId: playerId,
      });
    }

    return { success: true, game: payload };
  },

  async gameMiss(gameId, playerId) {
    const game = await prisma.partida.findFirst({
      where: {
        id: gameId,
        status: "playing",
        jogadores: {
          some: { jogadorId: playerId },
        },
      },
      include: {
        jogadores: {
          include: { jogador: true },
        },
      },
    });

    if (!game) {
      return { error: "Partida não encontrada" };
    }

    if (!game.maxTurnAt || new Date() < game.maxTurnAt) {
      return { error: "O tempo ainda não expirou" };
    }

    const missedPlayer = game.jogadores.find((j) => j.jogadorId !== playerId);

    if (!missedPlayer) {
      return { error: "Jogador não encontrado" };
    }

    await prisma.jogadorPartida.update({
      where: { id: missedPlayer.id },
      data: { erros: { increment: 1 } },
    });

    const updatedGame = await prisma.partida.update({
      where: { id: game.id },
      data: {
        lastPlayerId: missedPlayer.jogadorId,
        maxTurnAt: createTurnDeadline(60),
      },
      include: {
        jogadores: { include: { jogador: true } },
      },
    });

    const payload = buildGamePayload(updatedGame);

    broadcast.game(game.id, "game.updated", payload);

    return updatedGame;
  },
};