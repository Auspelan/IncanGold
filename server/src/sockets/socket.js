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

function broadcastRoomUpdate(room) {
  if (!io || !room) return;
  // 尽量只发送必要字段
  io.to(room.roomId).emit('roomUpdate', {
    roomId: room.roomId,
    players: room.players,
    // 如果 Room/ Game 有更结构化的状态，可以改这里
    isGameStarted: !!room.isGameStarted,
    game: room.game || null
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
        const playerName = payload.playerName || '匿名';
        const player = {
          socketId: socket.id,
          id: payload.playerId || ('p-' + Math.random().toString(36).slice(2,8)),
          name: playerName
        };

        if (payload.roomId) {
          const room = manager.getRoom(payload.roomId);
          if (!room) {
            if (typeof ack === 'function') ack({ ok: false, error: 'room not found' });
            return;
          }
          // addPlayer 在 Room 类中实现
          room.addPlayer(player);
          socket.join(room.roomId);

          // 如果人数已满，manager.startGame 会创建 Game 并标记
          if (room.getPlayerNum && room.getPlayerNum() === 3) {
            manager.startGame(room.roomId);
          }

          broadcastRoomUpdate(room);
          if (typeof ack === 'function') ack({ ok: true, roomId: room.roomId, players: room.players });
          return;
        }

        // 不指定 roomId -> 进入匹配队列（manager 会在合适时创建房间）
        manager.addPlayerToQueue(player);

        // 可能立即创建了房间/开始游戏，尝试查找玩家所在房间
        const joinedRoom = findRoomBySocketId(socket.id);
        if (joinedRoom) {
          socket.join(joinedRoom.roomId);
          broadcastRoomUpdate(joinedRoom);
          if (typeof ack === 'function') ack({ ok: true, roomId: joinedRoom.roomId, players: joinedRoom.players });
        } else {
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
        const { roomId, choice } = payload;
        const room = manager.getRoom(roomId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });

        const player = findPlayerInRoomBySocket(room, socket.id);
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        // 将选择委托给 manager（用 player.id）
        manager.makeChoice(roomId, player.id, choice);

        // 广播房间最新状态（Manager 内部会触发 gameUpdate 等，这里发送房间快照）
        const updatedRoom = manager.getRoom(roomId);
        broadcastRoomUpdate(updatedRoom);

        if (typeof ack === 'function') ack({ ok: true });
      } catch (err) {
        console.error('playerChoice error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    // 通用玩家动作（透传给房间内其他人）
    socket.on('playerAction', (payload = {}, ack) => {
      if (payload && payload.roomId) {
        io.to(payload.roomId).emit('playerAction', { fromSocket: socket.id, ...payload });
        if (typeof ack === 'function') ack({ ok: true });
      } else {
        if (typeof ack === 'function') ack({ ok: false, error: 'missing roomId' });
      }
    });

    // 主动离开房间
    socket.on('leaveRoom', (payload = {}, ack) => {
      try {
        const { roomId } = payload || {};
        if (!roomId) return ack && ack({ ok: false, error: 'missing roomId' });

        const room = manager.getRoom(roomId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });

        const player = findPlayerInRoomBySocket(room, socket.id);
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        manager.leaveRoom(roomId, player.id);
        socket.leave(roomId);

        const after = manager.getRoom(roomId);
        if (after) broadcastRoomUpdate(after);
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
      manager.leaveRoom(room.roomId, player.id);
      const after = manager.getRoom(room.roomId);
      if (after) broadcastRoomUpdate(after);
    });
  });

  return io;
}

function getIo() {
  return io;
}

function broadcastMessageUpdated(payload) {
  if (io) io.emit('messageUpdated', payload);
}

module.exports = {
  initSocket,
  getIo,
  broadcastMessageUpdated
};