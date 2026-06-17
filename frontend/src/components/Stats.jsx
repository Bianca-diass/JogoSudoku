import Timer from "./Timer";

function Stats({
  player1Points = 0,
  player2Points = 0,
  winner = "",
}) {

  return (
    <div className="topBar">

      <div className="playerCard">
        <h2>Jogador 1</h2>
        <p>Pontos: {player1Points}</p>
      </div>

      <Timer />

      <div className="playerCard">
        <h2>Jogador 2</h2>
        <p>Pontos: {player2Points}</p>
      </div>

      {winner && (
        <div className="playerCard">
          <h2>Vencedor</h2>
          <p>{winner}</p>
        </div>
      )}

    </div>
  );
}

export default Stats;