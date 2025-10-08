class Player {
  constructor(id, playerName, socket) {
    this.id = id;
    this.playerName = playerName;
    this.socket = socket;

    this.goldInCamp = 0;  // 营地的金币
    this.goldCarried = 0; // 携带的金币
    this.isOnRoad = false; // 是否在路上
    this.position = 0;     // 当前位置，0表示营地，每走一步增加1
    this.hasMadeChoice = false; // 在当前选择阶段是否已经做出选择
    this.choice = null;    // 选择：'move' 或 'back'
  }

  // 重置每轮的状态（除了营地金币）
  resetForNewRound() {
    this.goldInCamp += this.goldCarried;
    this.goldCarried = 0;
    this.isOnRoad = false;
    this.position = 0;
    this.hasMadeChoice = false;
    this.choice = null;
  }
}

module.exports = Player;