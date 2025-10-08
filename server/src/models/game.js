class Game {
  constructor(roomId, players, settings = {}) {
    this.gameId = this.generateGameId();
    this.roomId = roomId;
    
    // 玩家关系（直接引用Room中的玩家对象）
    this.players = players;

    this.settings = {
      entranceFee: settings.entranceFee || 50,
      initialGold: settings.initialGold || 0,
      totalRounds: settings.totalRounds || 3,
      totalSteps: settings.totalSteps || 20,
      totalTraps: settings.totalTraps || 2,
      maxGoldPerStep: settings.maxGoldPerStep || 9
    };
    
    // 游戏状态
    this.startedAt = Date.now();
    this.endedAt = null;

    this.currentRound = 1;
    this.trapNum = 0;
    this.currentStage = 'selection'; // selection, judgment, settlement
    this.roadGolds = this.initializeRoadGold(); // 路上剩余金币,-1则为陷阱

    this.isGameStarted = true;
    this.isGameFinished = false;
    this.finalRankings = [];

    this.roundHistory = [];
    this.actionsLog = [];

  }

// 获取玩家（通过玩家ID）
  getPlayer(playerId) {
    return this.players.find(player => player.playerId === playerId);
  }

// 生成游戏ID
  generateGameId() {
    return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

// 初始化路上金币和陷阱
  initializeRoadGold() {
    const road = [];
    const totalSteps = this.settings.totalSteps; // 假设路上有20步
    const totalTraps = this.settings.totalTraps;  // 假设有2个陷阱

    // 随机生成陷阱位置
    const trapPositions = new Set();
    while (trapPositions.size < totalTraps) {
      trapPositions.add(Math.floor(Math.random() * totalSteps));
    }

    // 初始化路上的金币
    for (let i = 0; i < totalSteps; i++) {
      if (trapPositions.has(i)) {
        road.push(-1); // 陷阱位置设为-1
      } else {
        road.push(Math.floor(Math.random() * this.settings.maxGoldPerStep) + 1); // 1到maxGoldPerStep的随机金币
      }
    }

    return road;
  }

// 开启新一轮
  startNewRound() {
    if (this.currentRound > this.settings.totalRounds) {
      this.isGameFinished = true;
      this.endedAt = Date.now();
      this.calculateFinalRankings();
      return;
    }

    // 重置玩家状态 (除了营地金币)
    this.players.forEach(player => player.resetForNewRound());

    // 重置游戏状态
    this.trapNum = 0;
    this.currentStage = 'selection';
    this.roadGolds = this.initializeRoadGold();

    this.currentRound += 1;
  }

// 计算最终排名
  calculateFinalRankings() {
    this.finalRankings = [...this.players]
      .sort((a, b) => b.goldInCamp - a.goldInCamp)
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        playerName: player.playerName,
        goldInCamp: player.goldInCamp
      }));
  }
  
}

module.exports = Game;