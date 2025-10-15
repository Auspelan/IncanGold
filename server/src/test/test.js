const GameSessionManager = require('../managers/Manager');
const Player = require('../models/player');

const manager = new GameSessionManager();

async function tests(){

    const player1 = new Player('player1','playerName1','s1');
    const player2 = new Player('player2','playerName2','s2');
    const player3 = new Player('player3','playerName3','s3');
    
    manager.addPlayerToQueue(player1);
    manager.addPlayerToQueue(player2);
    manager.addPlayerToQueue(player3);

    // console.log(manager);

    const roomIds = manager.getAllRoomIds();
    const roomId = roomIds[0];
    const room = manager.getRoom(roomId);
    const game = room.game;
    // console.log(game);
    // console.log(game.roadGolds);
    // console.log(room);
    console.log(`--- Round 1  ---`);
    console.log("Round:",game.currentRound);

    for(let i=1;i<=4;i++){

        manager.makeChoice(roomId,player1.playerId, 'advance');
        manager.makeChoice(roomId,player2.playerId, 'advance');
        manager.makeChoice(roomId,player3.playerId, 'advance');
        console.log(`--- Step ${i} ---`);
        console.log(game.roadGolds);
        console.log(player1.goldCarried);
    // console.log(game.AllPlayersSelected());
    }
    manager.makeChoice(roomId,player1.playerId, 'return');
    manager.makeChoice(roomId,player2.playerId, 'return');
    manager.makeChoice(roomId,player3.playerId, 'return');

    console.log(`--- Round 2  ---`);
    console.log("Round:",game.currentRound);

    for(let i=1;i<=3;i++){

        manager.makeChoice(roomId,player1.playerId, 'advance');
        manager.makeChoice(roomId,player2.playerId, 'advance');
        manager.makeChoice(roomId,player3.playerId, 'advance');
        console.log(`--- Step ${i} ---`);
        console.log(game.roadGolds);
        console.log(player1.goldCarried);
    }
    manager.makeChoice(roomId,player1.playerId, 'advance');
    manager.makeChoice(roomId,player2.playerId, 'return');
    manager.makeChoice(roomId,player3.playerId, 'return');

    manager.makeChoice(roomId,player1.playerId, 'return');

    console.log(`--- Round 3  ---`);
    console.log("Round:",game.currentRound);

    // console.log(game);

    manager.makeChoice(roomId,player1.playerId, 'advance');
    manager.makeChoice(roomId,player2.playerId, 'advance');
    manager.makeChoice(roomId,player3.playerId, 'advance');

    manager.makeChoice(roomId,player1.playerId, 'return');
    manager.makeChoice(roomId,player2.playerId, 'return');
    manager.makeChoice(roomId,player3.playerId, 'return');

    console.log("Round:",game.currentRound);
    console.log(game.finalRankings);
    console.log("Game Finished:",game.isGameFinished);


}

tests();