const Game = require('../models/room');

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.waitingPlayers = []; // 等待匹配的玩家
  }

  // 玩家请求匹配
  addPlayerToQueue(player) {
    // 将玩家加入等待队列，当有3个玩家时，创建房间并开始游戏
    this.waitingPlayers.push(player);
    if (this.waitingPlayers.length >= 3) {
      const playersForRoom = this.waitingPlayers.splice(0, 3);
      this.createRoom(playersForRoom);
    }
  }

  // 创建房间
  createRoom(players) {
    // 生成房间ID，创建房间，并将房间状态设置为等待中或游戏中
    const room = new Room(players);
    this.rooms.set(room.roomId, room);
    // 通知玩家房间已创建，游戏即将开始
  }

  // 根据房间ID获取房间
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  // 玩家离开房间
  leaveRoom(roomId, playerId) {
    // 处理玩家离开，如果房间人数为0，则销毁房间
  }
}

module.exports = RoomManager;