import { prisma } from "../lib/prisma.js";

export async function entrarPartida(jogadorId, partidaId) {
  return await prisma.jogadorPartida.create({
    data: {
      jogadorId,
      partidaId,
      erros: 0,
      jogadas: 0
    }
  });
}