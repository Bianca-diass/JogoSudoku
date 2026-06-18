import express from "express";
import cors from "cors";

import { gameService } from "./services/game.service.js";
import { playerService } from "./services/player.service.js";

const app = express();

app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());

// GAME
app.get("/game/:gameId", async (req, res) => {
  try {
    const { gameId } = req.params;

    const result = await gameService.getGame(gameId);

    // Se o serviço retornou um objeto com erro (ex: partida não encontrada)
    if (result?.error) {
      return res.status(404).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/game/create", async (req, res) => {
  try {
    const { playerId } = req.body;

    const game = await gameService.createGame(playerId.playerId);

    return res.status(201).json(game);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/game/join", async (req, res) => {
  try {
    const { gameId, playerId } = req.body;

    const result = await gameService.joinGame(gameId, playerId);

    if (result?.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/game/move", async (req, res) => {
  try {
    // Agora desestruturamos 'moves' do body, que deve ser um array de jogadas
    const { gameId, playerId, moves } = req.body;

    // Chamada ao novo método do service que valida o lote inteiro ("tudo ou nada")
    const result = await gameService.playMoves(gameId, playerId, moves);

    // Se qualquer uma das jogadas for inválida, o service retorna o erro e barra aqui
    if (result?.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/game/miss", async (req, res) => {
  try {
    const { gameId, playerId } = req.body;

    const result = await gameService.gameMiss(gameId, playerId);

    if (result?.error) {
      return res.status(400).json(result);
    }

    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});


// PLAYER

app.post("/player/create", async (req, res) => {
  try {
    const player = await playerService.create(req.body);

    return res.status(201).json(player);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
});

export default app;