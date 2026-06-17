import { entrarPartida } from "./services/jogadorPartida.service.js";

async function main() {
  const res = await entrarPartida(
    "ID_DO_JOGADOR",
    "ID_DA_PARTIDA"
  );

  console.log(res);
}

main();