const express = require('express');
const router = express.Router();
const gameControlController = require('../controllers/gameControl.controller');

router.get('/testapi',gameControlController.testapi)


module.exports = router;