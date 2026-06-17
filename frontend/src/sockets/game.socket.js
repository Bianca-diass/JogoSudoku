module.exports = (io) => {

  const salas = {};

  io.on("connection", (socket) => {

    console.log("Jogador conectado:", socket.id);

    socket.on("entrar-partida", (codigoSala) => {

      socket.join(codigoSala);

      if (!salas[codigoSala]) {
        salas[codigoSala] = {
          jogadores: [],
          tabuleiro: []
        };
      }

      salas[codigoSala].jogadores.push(socket.id);

      io.to(codigoSala).emit("jogadores-atualizados",
        salas[codigoSala].jogadores
      );

      console.log(`${socket.id} entrou na sala ${codigoSala}`);
    });

    socket.on("atualizar-celula", (dados) => {

      const {
        sala,
        linha,
        coluna,
        valor
      } = dados;

      socket.to(sala).emit("celula-atualizada", {
        linha,
        coluna,
        valor
      });
    });

    socket.on("atualizar-estatisticas", (dados) => {

      io.to(dados.sala).emit(
        "estatisticas-atualizadas",
        dados
      );
    });

    socket.on("fim-de-jogo", (resultado) => {

      io.to(resultado.sala).emit(
        "partida-finalizada",
        resultado
      );
    });

    socket.on("disconnect", () => {
      console.log("Jogador desconectado:", socket.id);
    });

  });
};