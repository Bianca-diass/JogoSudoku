import { createContext, useState } from "react";

export const RoomContext = createContext();

export function RoomProvider({ children }) {
  const [roomId, setRoomId] = useState("");

  return (
    <RoomContext.Provider value={{ roomId, setRoomId }}>
      {children}
    </RoomContext.Provider>
  );
}