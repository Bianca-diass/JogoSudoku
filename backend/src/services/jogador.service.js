import { prisma } from "../lib/prisma.js";

export async function criarJogador() {
  return await prisma.jogador.create({
    data: {
      nome: "João",
      pontos: 10
    }
  });
}