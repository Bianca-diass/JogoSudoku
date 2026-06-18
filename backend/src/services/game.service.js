import { isValidMove } from "../game/validation.js";
import { starters } from "../helper/starters.js";
import { prisma } from "../lib/prisma.js";
import {winCheck} from '../game/winCheck.js'

function getNumberFromDate(date = new Date()) {
  const ms = new Date(date).getTime();
  return ms % 2;
}

export const gameService = {
  async getGame(gameId) {
    
    const game = await prisma.partida.findFirst({
      where: { id: gameId }
    });

    if (!game) {
      return { error: "Partida não encontrada" };
    }

    return game;
  },
  async createGame(playerId) {
    const loadedGame = starters[getNumberFromDate()];

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

    return prisma.partida.update({
      where: {
        id: gameId,
      },
      data: shouldStart
        ? {
            status: "playing",
          }
        : {},
      include: {
        jogadores: {
          include: {
            jogador: true,
          },
        },
      },
    });
  },

  async playMoves(gameId, playerId, moves) {
  // 1. Validações iniciais da partida
    const game = await prisma.partida.findFirst({
      where: { id: gameId },
      include: {
        jogadores: true,
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

    // 2. Criamos uma cópia do tabuleiro para testar o lote completo
    let tempBoard = JSON.parse(game.tabuleiro);

    // 3. Loop de Validação Estrita
    for (const move of moves) {
      const { row, col, value } = move;

      // Ignora se for vazio (caso seu frontend envie células limpas)
      if (value === "") continue;

      // Se tentar preencher uma célula que JÁ estava ocupada no início do turno
      if (tempBoard[row][col] !== "") {
        // Incrementa 1 erro por tentativa inválida e cancela tudo
        await prisma.jogadorPartida.update({
          where: { id: player.id },
          data: { erros: { increment: 1 } },
        });
        return { error: `Jogada inválida na posição [${row}][${col}]: Célula já preenchida.` };
      }

      // Valida a regra do Sudoku (Linha, Coluna e Quadrante 3x3)
      const valid = isValidMove(tempBoard, row, col, value);

      if (!valid) {
        // Contabiliza o erro no banco de dados do jogador
        await prisma.jogadorPartida.update({
          where: { id: player.id },
          data: { erros: { increment: 1 } },
        });
        
        // Retorna o erro imediatamente, abortando o resto do lote
        return { error: `Jogada inválida na posição [${row}][${col}]: Quebra as regras do Sudoku.` };
      }

      // Aplica temporariamente na cópia para que a PRÓXIMA jogada do lote
      // saiba que esse número já está posicionado (validação entre as jogadas do próprio lote)
      tempBoard[row][col] = value;
    }

    // 4. Se o fluxo chegou até aqui, significa que TODO O LOTE É VÁLIDO!
    // Contabiliza a quantidade de jogadas com sucesso de uma vez só
    const totalJogadasSucedidas = moves.filter(m => m.value !== "").length;

    await prisma.jogadorPartida.update({
      where: { id: player.id },
      data: {
        jogadas: { increment: totalJogadasSucedidas },
      },
    });

    const complete = winCheck.isBoardComplete(tempBoard);

    // 5. Atualiza o tabuleiro definitivo e passa a vez
    return prisma.partida.update({
      where: { id: gameId },
      data: {
        tabuleiro: JSON.stringify(tempBoard),
        lastPlayerId: playerId, // Passa o turno apenas porque tudo deu certo
        status: complete ? "finished" : "playing",
      },
      include: {
        jogadores: {
          include: {
            jogador: true,
          },
        },
      },
    });
  }
};