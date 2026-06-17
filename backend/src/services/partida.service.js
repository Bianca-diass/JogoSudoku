import { prisma } from "../lib/prisma.js";

export async function criarPartida() {
  return await prisma.partida.create({
    data: {
      tabuleiro: "[]",
      status: "aguardando"
    }
  });
}