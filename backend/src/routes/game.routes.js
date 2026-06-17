import express from "express";
import { createGame, joinGame, playMove } from "../services/game.service.js";

const router = express.Router();

// 1. criar partida
router.post("/create", (req, res) => {
  const { playerId } = req.body;

  const gameId = createGame(playerId);

  res.json({ gameId });
});

// 2. entrar na partida
router.post("/join", (req, res) => {
  const { gameId, playerId } = req.body;

  const result = joinGame(gameId, playerId);

  res.json(result);
});

// 3. jogada
router.post("/move", (req, res) => {
  const { gameId, playerId, row, col, value } = req.body;

  const result = playMove(gameId, playerId, row, col, value);

  res.json(result);
});

export default router;