class Room {
  constructor(players = [], settings = {}) {
    this.roomId = this.generateRoomId();

    this.players = players;

    this.game = null; // 当前房间的游戏实例

    this.createdAt = Date.now();
    this.readyPlayers = new Set();
  }


// 生成房间ID
    generateRoomId() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

// 添加玩家
    addPlayer(player) {
        if (this.getPlayerNum() >= 3) {
            throw new Error('Room is full');
        }
        this.players.push(player);
        this.readyPlayers.delete(player.playerId);
    }

// 移除玩家
    removePlayer(playerId) {
        this.players = this.players.filter(p => p.playerId !== playerId);
        this.readyPlayers.delete(playerId);
    }

// 获取当前玩家数量
    getPlayerNum() {
        return this.players.length;
    }
    
// 获取玩家列表
    getPlayers() {
        return this.players;
    }

// 获取游戏实例
    getGame() {
        return this.game;
    }

    isPlayerFull() {
        return this.getPlayerNum() >= 3;
    }

    markReady(playerId) {
        this.readyPlayers.add(playerId);
    }

    clearReady() {
        this.readyPlayers.clear();
    }

    isEveryoneReady() {
        if (this.players.length === 0) return false;
        return this.readyPlayers.size === this.players.length;
    }

    getReadyPlayerIds() {
        return Array.from(this.readyPlayers);
    }

}

module.exports = Room;
