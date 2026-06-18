import http from "http";
import { Server } from "socket.io";

import app from "./app.js";
import { initSocket } from "./sockets/socket.js";

const PORT = process.env.PORT || 3001;

function printRoutes(app) {
  const routes = [];

  const stack = app.router?.stack || app._router?.stack || [];

  stack.forEach((layer) => {
    if (!layer.route) return;

    routes.push({
      method: Object.keys(layer.route.methods)
        .map((m) => m.toUpperCase())
        .join(", "),
      path: layer.route.path,
    });
  });

  console.table(routes);
}

printRoutes(app)

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

initSocket(io);

server.listen(PORT, () => {
  console.log(`🚀 HTTP Server: http://localhost:${PORT}`);
  console.log(`🔌 Socket.IO ativo na porta ${PORT}`);
});

server.on("error", (error) => {
  console.log(app)
  console.error("Erro ao iniciar servidor:", error);
});