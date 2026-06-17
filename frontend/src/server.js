socket.on("createRoom", (callback) => {
  const roomId = Math.random().toString(36).substring(2, 7).toUpperCase();

  rooms[roomId] = {
    players: [],
  };

  callback(roomId);
});3