import { useContext, useEffect, useState } from "react";
import { RoomContext } from "../context/RoomContext";
import socket from "../services/socket";
import { useNavigate } from "react-router-dom";

export default function Lobby() {
  const { roomId } = useContext(RoomContext);
  const [players, setPlayers] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) return;

    socket.emit("joinRoom", roomId, (res) => {
      console.log(res);
    });

    socket.on("playerUpdate", (count) => {
      setPlayers(count);
    });

    socket.on("startGame", () => {
      navigate("/jogo");
    });

    return () => {
      socket.off("playerUpdate");
      socket.off("startGame");
    };
  }, [roomId]);

  return (
    <div>
      <h1>Lobby: {roomId}</h1>
      <p>Jogadores: {players}/2</p>
    </div>
  );
}