import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../services/socket";
import { RoomContext } from "../context/RoomContext";

export default function CriarPartida() {
  const { setRoomId } = useContext(RoomContext);
  const navigate = useNavigate();

  useEffect(() => {
    socket.emit("createRoom", (roomId) => {
      setRoomId(roomId);
      navigate("/lobby");
    });
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Criando sala...</h1>
    </div>
  );
}