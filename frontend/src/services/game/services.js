import api from "../api";

export const gameService = {
  async find(gameId){
    const { data } = await api.get(`/game/${gameId}`);

    return data;
  },
  async create(playerId, name) {
    const { data } = await api.post("/game/create", {
      playerId
    });

    return data;
  },

  async joinGame(gameId, playerId) {
    const { data } = await api.post("/game/join", {
      gameId,
      playerId,
    });

    return data;
  },

  async playMoves(gameId, playerId, moves) {
    const { data } = await api.post("/game/move", {
      gameId,
      playerId,
      moves,
    });

    return data;
  },
  async miss(gameId, playerId){
    const { data } = await api.post("/game/miss", {
      gameId,
      playerId
    });

    return data;
  }
};