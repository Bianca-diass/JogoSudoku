import { fazerJogada } from "./services/partida.service.js";

async function main() {
  const res = await fazerJogada(
    "12345cmqcxk5y10000i97cvwb1qnu9",
    0,
    0,
    5
  );

  console.log(JSON.parse(res.tabuleiro));
}

main();