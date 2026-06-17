import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import { RoomContext } from "../context/RoomContext";

export default function EntrarPartida() {
  const [code, setCode] = useState("");
  const { setRoomId } = useContext(RoomContext);
  const navigate = useNavigate();

  const entrarSala = () => {
    socket.emit("joinRoom", code, (res) => {
      if (res.error) {
        alert(res.error);
        return;
      }

      setRoomId(code);
      navigate("/lobby");
    });
  };

  return (
    <div>
      <h1>Entrar na Partida</h1>

      <input
        placeholder="Código da sala"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />

      <button onClick={entrarSala}>
        Entrar
      </button>
    </div>
  );
}