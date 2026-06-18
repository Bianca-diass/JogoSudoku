export function buildGamePayload(game) {
  return {
    gameId: game.id,
    status: game.status,
    board: JSON.parse(game.tabuleiro),

    players: game.jogadores.map((item) => ({
      id: item.jogador.id,
      nome: item.jogador.nome,
      erros: item.erros,
      jogadas: item.jogadas,
    })),
  };
}