class Player {
  constructor(playerId, playerName, socket) {
    this.playerId = playerId;
    this.playerName = playerName;
    this.socket = socket;

    this.goldInCamp = 0;  // 营地的金币
    this.goldCarried = 0; // 携带的金币
    this.isOnRoad = false; // 是否在路上
    this.position = 0;     // 当前位置，0表示营地，每走一步增加1
    this.hasMadeChoice = false; // 在当前选择阶段是否已经做出选择
    this.choice = null;    // 选择：'advance' 或 'return'
  }

  // 重置每轮的状态（除了营地金币）
  resetForNewRound() {
    this.goldCarried = 0;
    this.isOnRoad = true;
    this.position = 0;
    this.hasMadeChoice = false;
    this.choice = null;
  }

  resetForNewGame() {
    this.goldInCamp = 0;
    this.goldCarried = 0;
    this.isOnRoad = true;
    this.position = 0;
    this.hasMadeChoice = false;
    this.choice = null;
  }

  makeChoice(choice) {
    if(this.hasMadeChoice){
      return;
    }
    this.choice = choice;
    this.hasMadeChoice = true;
  }

  returnCamp(){
    this.position = 0;
    this.isOnRoad = false;
    this.goldInCamp += this.goldCarried;
    this.goldCarried = 0;
    this.hasMadeChoice = false;
    this.choice = null;
  }

  trapEncounter(){
    this.goldCarried = 0;
    this.returnCamp();
  }

  advanceTo(newPosition){
    this.position = newPosition;
    this.isOnRoad = true;
    this.hasMadeChoice = false;
    this.choice = null;
  }

}

module.exports = Player;