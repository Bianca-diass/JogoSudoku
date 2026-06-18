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

export function emit(channel, event, data) {
  ioInstance.to(channel).emit(event, data);
}