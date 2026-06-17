const GameService = require("../services/game.service");

class GameController {
  async create(req, res) {
    const game = await GameService.create(req.body);

    return res.status(201).json(game);
  }

  async join(req, res) {
    const game = await GameService.join(
      req.params.gameId,
      req.body.playerId
    );

    return res.json(game);
  }
}

module.exports = new GameController();