class MoveService {
  async validate(data) {
    const {
      gameId,
      playerId,
      added,
      removed,
      board,
    } = data;

    // VALIDAR REGRAS

    return {
      valid: true,
      gameId,
      playerId,
      board,
      nextPlayer: 2,
    };
  }
}

module.exports = new MoveService();