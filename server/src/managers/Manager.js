const Room = require('../models/room');
const Game = require('../models/game');
const Player = require('../models/player');

const blockchainService = require('../services/blockchain.service');

class GameSessionManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.games = new Map(); // gameId -> Game
    this.players = new Map(); // playerId -> Player
  }

  // 玩家请求匹配
  async addPlayerToQueue(player) {
    // 优先填充已有未满房间
    for (const room of this.rooms.values()) {
      if (!room.isPlayerFull()) {
        room.addPlayer(player);
        if(room.isPlayerFull()){
          const res = await this.startGame(room.roomId);
          if(!res.ok){
            console.error('Failed to start game for room:', room.roomId);
            return res;
          }
        }
      }
    }
    // 否则创建新房间等待其他玩家
    this.createRoom([player]);
    return { ok: true };
  }

  createPlayer(playerId, playerName, socket) {
    const player = new Player(playerId, playerName, socket);
    this.players.set(playerId, player);
    return player;
  }

  removePlayer(playerId) {
    this.players.delete(playerId);
  }

  // 创建房间
  createRoom(players) {
    // 生成房间ID，创建房间，并将房间状态设置为等待中或游戏中
    const room = new Room(players);
    this.rooms.set(room.roomId, room);
    return room;
  }

  async createGame(roomId, players){
    const entryFee = '10000000000000000'; // 0.01 ETH in wei
    console.log(`Creating game in room ${roomId} with entry fee: ${entryFee} wei`);
    const settings = { entranceFee: entryFee };
    
    const room = this.getRoom(roomId);
    // 暂时以区块链上的入场费为准
    const game = new Game(roomId, players, settings);
    this.games.set(game.gameId, game);
    room.game = game;

    try{
      // Notify blockchain about game creation — 并行发起并等待全部完成
      const joinPromises = players.map(player =>
        blockchainService.joinGameOnChain(game.gameId, player.playerId)
          .then(res => ({ player, res }))
          .catch(err => ({ player, res: { ok: false, error: String(err) } }))
      );

      const results = await Promise.all(joinPromises);
      const failed = results.filter(r => !r.res || r.res.ok === false);
      if (failed.length > 0) {
        failed.forEach(f => {
          console.warn(`Failed to join game on-chain for player ${f.player.playerName || f.player.playerId}: ${f.res && f.res.error}`);
        });
        console.error(`Failed to create game ${game.gameId} due to blockchain join errors.`);
        this.clearGame(roomId);
        return { ok: false, errors: failed.map(f => f.res && f.res.error) };
      }

      return { ok: true };
    } catch (error) {
        console.error('Error creating game:', error);
    }
  }

  clearGame(roomId){
    const room = this.getRoom(roomId);
    if(room && room.game){
      this.games.delete(room.game.gameId);
      room.game = null;
      room.clearReady();
    }
  }

  clearRoom(roomId) {
    this.clearGame(roomId);
    this.rooms.delete(roomId);
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

  getPlayer(playerId) {
    return this.players.get(playerId);
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
  async startGame(roomId){
    const room = this.getRoom(roomId);
    room.clearReady();
    const res = await this.createGame(roomId,room.players);
    if(!res.ok){
      console.error('Failed to start game for room:', roomId);
      return res;
    }
    return res;
  }

  //玩家作出选择
  makeChoice(roomId,playerId,choice){
    const room = this.getRoom(roomId);
    const game = room.game;
    game.makeChoice(playerId,choice);
    if(game.AllPlayersSelected()){
      game.gameUpdate();
    }
  }

  settleGameOnChain(gameId){
    const game = this.getGame(gameId);
    const winners = [];
    const payouts = [];
    game.finalRankings.forEach(ranking => {
        winners.push(ranking.playerId);
        payouts.push(ranking.etherChange);
    });
    return blockchainService.settleGameOnChain(gameId, winners, payouts);
  }

  isGameStarted(roomId){
    const room = this.getRoom(roomId);
    const game = room.game;
    if(!game) return false;
    return game.isGameStarted;
  }

  isGameFinished(roomId){
    const room = this.getRoom(roomId);
    const game = room.game;
    return game.isGameFinished;
  }
}

module.exports = GameSessionManager;
