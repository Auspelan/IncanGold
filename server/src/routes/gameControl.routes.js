// /home/zephyr/IncanGold/server/src/routes/gameControl.routes.js

const express = require('express');
const router = express.Router();
const gameControlController = require('../controllers/gameControl.controller');

router.get('/testapi', gameControlController.testapi);

// New routes for blockchain interaction
router.get('/contract-info', gameControlController.getContractInfo);
router.post('/settle-game', gameControlController.settleGame);

module.exports = router;