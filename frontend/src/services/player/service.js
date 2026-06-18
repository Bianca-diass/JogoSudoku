import api from "../api";

export const playerService = {
  async create(nome) {
    const { data } = await api.post("/player/create", {
      nome,
    });

    return data;
  },
};