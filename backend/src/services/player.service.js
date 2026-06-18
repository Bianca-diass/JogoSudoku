import { prisma } from "../lib/prisma.js";

export const playerService = {
  async create(data) {
    const player = await prisma.jogador.create({
      data: {
        nome: data.nome,
      },
    });

    return player;
  },
};