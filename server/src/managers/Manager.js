const Room = require('../models/room');
const Game = require('../models/game');

class GameSessionManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.games = new Map(); // gameId -> Game
    this.waitingPlayers = []; // 等待匹配的玩家
  }

  // 玩家请求匹配
  addPlayerToQueue(player) {
    // 遍历房间，检查是否有房间可以加入
    for (const room of this.rooms.values()) {
      if (room.getPlayerNum() < 3) {
        room.addPlayer(player);
        if(room.getPlayerNum() === 3){
          this.startGame(room.roomId);
        }
        return;
      }
    }

    this.waitingPlayers.push(player);

    if (this.waitingPlayers.length >= 3) {
      const playersForRoom = this.waitingPlayers.splice(0, 3);
      const room = this.createRoom(playersForRoom);
      this.startGame(room.roomId);
      this.waitingPlayers = this.waitingPlayers.filter(p => !playersForRoom.includes(p));
    }
  }

  // 创建房间
  createRoom(players) {
    // 生成房间ID，创建房间，并将房间状态设置为等待中或游戏中
    const room = new Room(players);
    this.rooms.set(room.roomId, room);
    return room;
  }

  createGame(roomId, players) {
    const room = this.getRoom(roomId);
    const game = new Game(roomId, players);
    this.games.set(game.gameId, game);
    room.game = game;
    return game;
  }

  getAllRoomIds() {
    return Array.from(this.rooms.keys());
  }

  // 根据房间ID获取房间
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  getGame(gameId) {
    return this.games.get(gameId);
  }

  // 玩家离开房间
  leaveRoom(roomId, playerId) {
    // 处理玩家离开，如果房间人数为0，则销毁房间
    const room = this.getRoom(roomId);
    room.removePlayer(playerId);
    if (room.getPlayerNum() === 0) {
      this.rooms.delete(roomId);
    }
  }

  // 人齐开始游戏
  startGame(roomId){
    const room = this.getRoom(roomId);
    room.game = this.createGame(roomId,room.players);
    room.isGameStarted = true;
  }

  //玩家作出选择
  makeChoice(roomId,playerId,choice){
    const room = this.getRoom(roomId);
    const game = room.game;
    game.makeChoice(playerId,choice);
    if(game.AllPlayersSelected()){
      game.currentStage = 'judgment';
      game.gameUpdate();
    }
  }
}

module.exports = GameSessionManager;