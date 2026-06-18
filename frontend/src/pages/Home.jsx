import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { playerService } from "../services/player/service";
import { gameService } from "../services/game/services";

function Home() {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const createGame = async () => {
    if (!playerName.trim()) {
      alert("Digite seu nome");
      return;
    }

    try {
      const player = await playerService.create(playerName)

      localStorage.setItem('playerId',player.id)
      localStorage.setItem('playerName',player.nome)

      const game = await gameService.create({playerId:player.id})

      navigate(`/jogo/${game.id}`);
    } catch (error) {
        console.log(error)
        alert('Erro ao criar partida')
    }
  };

  const joinGame = async () => {
    if (!playerName.trim()) {
      alert("Digite seu nome");
      return;
    }

    try {
      const player = await playerService.create(playerName)

      localStorage.setItem('playerId',player.id)
      localStorage.setItem('playerName',player.nome)

      const game = await gameService.joinGame(joinId,player.id)

      navigate(`/jogo/${joinId}`);
    } catch (error) {
        console.log(error)
        alert('Erro ao tentar se juntar a partida')
    }
  };

  return (
    <div className="home-container">

      <h1>Bem-vindo ao Sudoku PvP</h1>

      <p className="subtitle">
        Teste sua mente contra outros jogadores
      </p>

      <input
        className="player-input"
        placeholder="Digite seu nome"
        value={playerName}
        onChange={(e) =>
          setPlayerName(e.target.value)
        }
      />

      <button
        className="btn-enter"
        onClick={createGame}
      >
        Criar Partida
      </button>

      <button
        className="btn-enter"
        onClick={() => setShowModal(true)}
      >
        Participar da Partida
      </button>

      {showModal && (
        <div className="modal">

          <div className="modal-content">

            <h2>Entrar em Partida</h2>

            <input
              className="player-input"
              placeholder="ID da partida"
              value={joinId}
              onChange={(e) =>
                setJoinId(e.target.value)
              }
            />

            <button
              className="btn-enter"
              onClick={joinGame}
            >
              Entrar
            </button>

            <button
              className="btn-enter"
              onClick={() => setShowModal(false)}
            >
              Cancelar
            </button>

          </div>

        </div>
      )}

    </div>
  );
}

export default Home;