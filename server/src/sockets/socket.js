const { Server } = require('socket.io');
const GameSessionManager = require('../managers/Manager');

let io = null;
const manager = new GameSessionManager(); // 单例 manager

function findRoomBySocketId(socketId) {
  for (const room of manager.rooms.values()) {
    if (room.players && room.players.find(p => p.socketId === socketId)) return room;
  }
  return null;
}

function findPlayerInRoomBySocket(room, socketId) {
  if (!room || !room.players) return null;
  return room.players.find(p => p.socketId === socketId) || null;
}

function broadcastRoomUpdate(room){
    if (!io || !room) return;
    io.to(room.roomId).emit('roomUpdate', {
        room: room
    });
}

function broadcastGameUpdate(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('gameUpdate', {
    game: room.game
  });
}

function broadcastRoomAssign(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('roomAssign', {
    room: room
  });
}

function broadcastGameStart(room) {
    if (!io || !room) return;
    io.to(room.roomId).emit('gameStart', {
        game: room.game
    });
}

function broadcastGameOver(room) {
    if (!io || !room) return;
    io.to(room.roomId).emit('gameOver', {
        finalResults: room.game.finalRankings
    });
}

function initSocket(server, options = {}) {
  if (io) return io;
  io = new Server(server, {
    cors: {
      origin: process.env.SOCKET_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true
    },
    ...options
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('ping', () => socket.emit('pong'));

    // 请求加入指定房间或进入匹配队列
    socket.on('joinRoom', (payload = {}, ack) => {
        console.log('joinRoom payload:', payload);
      try {
        const player = manager.createPlayer(payload.playerId, payload.playerName, socket);

        // 进入匹配队列（manager 会在合适时创建房间）
        manager.addPlayerToQueue(player);

        // 可能立即创建了房间/开始游戏，尝试查找玩家所在房间
        const joinedRoom = findRoomBySocketId(socket.id);

        if (joinedRoom) {
            // 加入 socket.io 房间
          joinedRoom.players.forEach(p => {
            try {
              const s = io.sockets.sockets.get(p.socketId);
              if (s) s.join(joinedRoom.roomId);
            } catch (e) {
              // 忽略：可能该玩家已断开，后续 broadcastRoomUpdate 会反映实际玩家列表
            }
          });
          
          broadcastRoomAssign(joinedRoom);
          broadcastGameStart(joinedRoom);
          if (typeof ack === 'function') ack({ ok: true, roomId: joinedRoom.roomId, players: joinedRoom.players });
        }
        else {
          // 进入等待队列
          if (typeof ack === 'function') ack({ ok: true, waiting: true });
        }
      } catch (err) {
        console.error('joinRoom error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    // 玩家在房间内做选择（前进/返回）
    socket.on('playerChoice', (payload = {}, ack) => {
      try {
        const { roomId, playerId, choice } = payload;
        const room = manager.getRoom(roomId);
        const player = manager.getPlayer(playerId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });

        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        // 将选择委托给 manager（用 player.id）
        manager.makeChoice(roomId, playerId, choice);

        // 广播房间最新状态（Manager 内部会触发 gameUpdate 等，这里发送房间快照）
        const updatedRoom = manager.getRoom(roomId);
        broadcastGameUpdate(updatedRoom.game);
        if(manager.isGameFinished(roomId)){
            broadcastGameOver(updatedRoom);
        }

        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('playerChoice error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('continuePlay', (payload = {}, ack) => {
      try {
        const { roomId, playerId } = payload;
        const room = manager.getRoom(roomId);
        const player = manager.getPlayer(playerId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });
        // 重置游戏状态
        manager.clearGame(roomId);
        broadcastRoomUpdate(room);
        if(room.isPlayerFull()){
            manager.startGame(roomId);
            broadcastGameStart(room);
        }

        socket.emit('returnRoom', {});
        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('continuePlay error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    // 主动离开房间
    socket.on('leaveRoom', (payload = {}, ack) => {
      try {
        const { roomId, playerId } = payload || {};
        if (!roomId) return ack && ack({ ok: false, error: 'missing roomId' });

        const room = manager.getRoom(roomId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });
        const player = manager.getPlayer(playerId);
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        manager.leaveRoom(roomId, player.id);
        socket.leave(roomId);

        const after = manager.getRoom(roomId);
        if (after) broadcastRoomUpdate(after);

        socket.emit('returnLobby', {});
        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('leaveRoom error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected ${socket.id}: ${reason}`);
      const room = findRoomBySocketId(socket.id);
      if (!room) return;
      const player = findPlayerInRoomBySocket(room, socket.id);
      if (!player) return;
      // 使用 manager 清理玩家
      manager.leaveRoom(room.roomId, player.playerId);
      const after = manager.getRoom(room.roomId);
      if (after) broadcastRoomUpdate(after);
    });
  });

  return io;
}

function getIo() {
  return io;
}

module.exports = {
  initSocket,
  getIo
};