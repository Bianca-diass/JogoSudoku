import { buscarPartida } from "./services/partida.service.js";

async function main() {
  const partida = await buscarPartida("COLOCA_ID_AQUI");

  console.log(partida);
  console.log(JSON.parse(partida.tabuleiro));
}

main();