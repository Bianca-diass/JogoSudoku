let ioInstance;

export function initSocket(io) {
  ioInstance = io;

  io.on("connection", (socket) => {
    console.log(`Conectado: ${socket.id}`);

    socket.on("subscribe", (channel) => {
      socket.join(channel);
    });

    socket.on("disconnect", () => {
      console.log(`Desconectado: ${socket.id}`);
    });
  });
}

export const broadcast = {
  game(gameId, event, payload = {}) {
    ioInstance.to(`game.${gameId}`).emit(event, payload);
  },
};