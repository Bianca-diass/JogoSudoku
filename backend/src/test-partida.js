import { criarPartida } from "./services/partida.service.js";

async function main() {
  const partida = await criarPartida();
  console.log(partida);
}

main();