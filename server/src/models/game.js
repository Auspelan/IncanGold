class Game {
  constructor(roomId, players, settings = {}) {
    this.gameId = this.generateGameId();
    this.roomId = roomId;
    
    // 玩家关系（直接引用Room中的玩家对象）
    this.players = players;
    this.players.forEach(player => player.resetForNewGame());

    // if (settings.entranceFee && typeof settings.entranceFee.then === 'function') {
    //   throw new Error('entranceFee must be resolved (await) before creating Game');
    // }

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

    this.currentStep = 0;
    this.trapEncountered = false;
    this.roadGolds = this.initializeRoadGold(); // 路上剩余金币,-1则为陷阱

    this.isGameStarted = true;
    this.isGameFinished = false;
    this.finalRankings = [];

    this.roundHistory = [];
    this.actionsLog = [];
    this.lastEvent = null;
    this.lastEventByPlayer = {};
    this.eventSeq = 0;
    this.lastEventTick = 0;

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
    road.push(0); // 第0步为营地，没有金币
    for (let i = 1; i <= totalSteps; i++) {
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
    this.currentRound += 1;

    // 检查是否超过总轮数
    if (this.currentRound > this.settings.totalRounds) {
      this.calculateFinalRankings();
      this.endedAt = Date.now();
      this.isGameFinished = true;
      return;
    }

    // 重置玩家状态 (除了营地金币)
    this.players.forEach(player => player.resetForNewRound());

    // 重置游戏状态
    this.currentStep = 0;
    this.trapEncountered = false;
    this.roadGolds = this.initializeRoadGold();
  }

// 计算最终排名
  calculateFinalRankings() {
    const totalGold = this.players.reduce((sum, player) => sum + player.goldInCamp, 0);

    const entranceFeeBN = BigInt(String(this.settings.entranceFee || '0'));
    const multiplier = 3n;

    if (totalGold === 0) {
      // 防护：没有金币时返回默认
      this.finalRankings = this.players.map((player, index) => ({
        rank: index + 1,
        playerId: player.playerId,
        playerName: player.playerName,
        finalGold: player.goldInCamp || 0,
        etherChange: '0'
      }));
      return;
    }
    
    this.finalRankings = [...this.players]
      .sort((a, b) => b.goldInCamp - a.goldInCamp)
      .map((player, index) => {
        const shareBN = (entranceFeeBN * multiplier * BigInt(Math.floor(player.goldInCamp || 0))) / BigInt(totalGold);
        return {
        rank: index + 1,
        playerId: player.playerId,
        playerName: player.playerName,
        finalGold: player.goldInCamp,
        etherChange: shareBN.toString()
      };
    });
  }


  // 玩家作出选择
  makeChoice(playerId, choice) {
    const player = this.getPlayer(playerId);
    if (!player) {
      throw new Error('Player not found');
    }
    player.makeChoice(choice);
  }

  // 更新游戏状态
  gameUpdate(){
    const eventDetails = {};
    let event = null;

    var playersReturn = [];
    var playersAdvance = [];
    this.players.forEach(player => {
      if(player.choice === 'return'){
        playersReturn.push(player);
      }else if(player.choice === 'advance'){
        playersAdvance.push(player);
      }
    });

    var returnedPlayerCount = playersReturn.length;
    if(returnedPlayerCount > 0){
      var goldFromRoad = 0;
      for(let i=1; i<=this.currentStep; i++){
        if(this.roadGolds[i] > 0){
          goldFromRoad += Math.floor(this.roadGolds[i]/returnedPlayerCount);
          this.roadGolds[i] = this.roadGolds[i] % returnedPlayerCount;
        }
      }
      playersReturn.forEach(player => {
        const carryBefore = player.goldCarried;
        player.goldCarried += goldFromRoad;
        player.returnCamp();
        eventDetails[player.playerId] = {
          type: 'return',
          gained: carryBefore + goldFromRoad,
          share: goldFromRoad
        };
      });
      if(!event) event = 'players-return';
    }

    var advancedPlayerCount = playersAdvance.length;
    if(advancedPlayerCount > 0){
      this.currentStep += 1;
      if(this.roadGolds[this.currentStep] === -1){
        if(!this.trapEncountered){
          this.trapEncountered = true;
          playersAdvance.forEach(player => {
            player.advanceTo(this.currentStep);
            eventDetails[player.playerId] = { type: 'trap-first' };
          });
          event = 'trap-first';
        }
        else{
          playersAdvance.forEach(player => {
            const lost = player.goldCarried;
            player.trapEncounter();
            eventDetails[player.playerId] = {
              type: 'trap-second',
              lost: lost
            };
          });
          event = 'trap-second';
        }
      }
      else{
        const totalGold = this.roadGolds[this.currentStep];
        const share = Math.floor(totalGold / advancedPlayerCount);
        const remainder = totalGold % advancedPlayerCount;
        playersAdvance.forEach(player => player.advanceTo(this.currentStep));
        playersAdvance.forEach(player => {
          player.goldCarried += share;
          eventDetails[player.playerId] = {
            type: share > 0 ? 'reward' : 'advance',
            gained: share
          };
        });
        this.roadGolds[this.currentStep] = remainder;
        event = share > 0 ? 'reward' : (event || 'advance');
      }
    }

    const allReturned = this.AllPlayersReturned();
    if(allReturned){
      if(!event) event = 'round-end';
      this.startNewRound();
    }

    const fallbackType = (() => {
      if (event === 'players-return') return 'return';
      if (event === 'reward') return 'advance';
      if (event === 'round-end') return 'round-end';
      return event || 'advance';
    })();

    this.players.forEach(player => {
      if (!eventDetails[player.playerId]) {
        eventDetails[player.playerId] = { type: fallbackType };
      }
    });

    this.eventSeq += 1;
    const tick = this.eventSeq;

    this.players.forEach(player => {
      const detail = eventDetails[player.playerId] || (eventDetails[player.playerId] = { type: fallbackType });
      detail.tick = tick;
    });

    this.lastEvent = event;
    this.lastEventByPlayer = eventDetails;
    this.lastEventTick = tick;
  }
  
  // 检查是否全部玩家已经作出选择
  AllPlayersSelected() {
    return this.players.every(player =>!player.isOnRoad || player.hasMadeChoice);
  }

  // 检查是否所有玩家都已返回营地或遇到陷阱
  AllPlayersReturned() {
    return this.players.every(player => !player.isOnRoad);
  }
}

module.exports = Game;
