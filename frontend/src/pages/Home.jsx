import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const [playerName, setPlayerName] = useState("");
  const [joinId, setJoinId] = useState("");
  const [showModal, setShowModal] = useState(false);

  const createGame = () => {
    if (!playerName.trim()) {
      alert("Digite seu nome");
      return;
    }

    const gameId = Date.now().toString();

    localStorage.setItem("playerName", playerName);

    navigate(`/jogo/${gameId}`);
  };

  const joinGame = () => {
    if (!playerName.trim()) {
      alert("Digite seu nome");
      return;
    }

    if (!joinId.trim()) {
      alert("Digite o ID da partida");
      return;
    }

    localStorage.setItem("playerName", playerName);

    navigate(`/jogo/${joinId}`);
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