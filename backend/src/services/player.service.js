const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class PlayerService {
  async create(data) {
    const player = await prisma.player.create({
      data: {
        name: data.name,
        link: data.link,
      },
    });

    return player;
  }
}

module.exports = new PlayerService();