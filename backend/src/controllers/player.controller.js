const PlayerService = require("../services/player.service");

class PlayerController {
  async create(req, res) {
    try {
      const player = await PlayerService.create(req.body);

      return res.status(201).json(player);
    } catch (error) {
      return res.status(500).json({
        error: error.message,
      });
    }
  }
}

module.exports = new PlayerController();