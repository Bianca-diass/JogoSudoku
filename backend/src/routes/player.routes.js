const express = require("express");
const router = express.Router();
const PlayerController = require("../controllers/player.controller");

router.post("/", PlayerController.create);

module.exports = router;