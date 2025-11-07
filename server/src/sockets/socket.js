const { Server } = require('socket.io');
const GameSessionManager = require('../managers/Manager');

let io = null;
const manager = new GameSessionManager();

// ----------------------
// Helpers: sanitize complex objects before emitting to clients
// ----------------------
function toPlainPlayer(player) {
  if (!player) return null;
  return {
    playerId: player.playerId,
    playerName: player.playerName,
    goldInCamp: player.goldInCamp,
    goldCarried: player.goldCarried,
    isOnRoad: player.isOnRoad,
    position: player.position,
    hasMadeChoice: player.hasMadeChoice,
    choice: player.choice,
  };
}

function toPlainGame(game) {
  if (!game) return null;
  return {
    gameId: game.gameId,
    roomId: game.roomId,
    currentRound: game.currentRound,
    currentStep: game.currentStep,
    trapEncountered: game.trapEncountered,
    roadGolds: Array.isArray(game.roadGolds) ? [...game.roadGolds] : [],
    isGameStarted: game.isGameStarted,
    isGameFinished: game.isGameFinished,
    finalRankings: Array.isArray(game.finalRankings) ? [...game.finalRankings] : [],
    players: Array.isArray(game.players) ? game.players.map(toPlainPlayer) : [],
    lastEvent: game.lastEvent || null,
    lastEventTick: game.lastEventTick || 0,
    lastEventByPlayer: game.lastEventByPlayer ? Object.fromEntries(
      Object.entries(game.lastEventByPlayer).map(([playerId, detail]) => [playerId, { ...detail }])
    ) : {},
  };
}

function toPlainRoom(room) {
  if (!room) return null;
  return {
    roomId: room.roomId,
    createdAt: room.createdAt,
    players: Array.isArray(room.players) ? room.players.map(toPlainPlayer) : [],
    game: toPlainGame(room.game),
    readyPlayers: room.getReadyPlayerIds ? room.getReadyPlayerIds() : [],
  };
}

function findRoomBySocketId(socketId) {
  for (const room of manager.rooms.values()) {
    if (room.players && room.players.find(p => p.socket && p.socket.id === socketId)) {
      return room;
    }
  }
  return null;
}

function findPlayerInRoomBySocket(room, socketId) {
  if (!room || !room.players) return null;
  return room.players.find(p => p.socket && p.socket.id === socketId) || null;
}

function ensureSocketJoinsRoom(room) {
  if (!io || !room || !Array.isArray(room.players)) return;
  room.players.forEach(player => {
    if (!player?.socket) return;
    try {
      if (typeof player.socket.join === 'function') {
        player.socket.join(room.roomId);
      } else if (player.socket.id) {
        const s = io.sockets.sockets.get(player.socket.id);
        if (s) s.join(room.roomId);
      }
    } catch (err) {
      // Ignore join failures; roomUpdate will later reflect actual active sockets
    }
  });
}

function broadcastRoomUpdate(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('roomUpdate', {
    room: toPlainRoom(room)
  });
}

function broadcastRoomAssign(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('roomAssign', {
    room: toPlainRoom(room)
  });
}

function broadcastGameStart(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('gameStart', {
    game: toPlainGame(room.game)
  });
}

function broadcastGameUpdate(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('gameUpdate', {
    game: toPlainGame(room.game)
  });
}

function broadcastGameOver(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('gameOver', {
    finalResults: Array.isArray(room.game?.finalRankings) ? [...room.game.finalRankings] : []
  });
}

function broadcastReturnLobby(room) {
  if (!io || !room) return;
  io.to(room.roomId).emit('ReturnLobby', {});
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

    socket.on('joinRoom', async (payload = {}, ack) => {
      console.log('joinRoom payload:', payload);
      try {
        const playerId = payload.playerId || socket.id;
        const playerName = payload.playerName || `Player-${socket.id.slice(-4)}`;

        const player = manager.createPlayer(playerId, playerName, socket);
        const res = await manager.addPlayerToQueue(player);
        if (!res.ok) {
          console.error('Failed to add player to queue:', res.error);
          broadcastReturnLobby(socket);
          if (typeof ack === 'function') ack({ ok: false, error: res.error });
          return;
        }

        const joinedRoom = findRoomBySocketId(socket.id);

        if (joinedRoom) {
          ensureSocketJoinsRoom(joinedRoom);
          broadcastRoomAssign(joinedRoom);
          if (joinedRoom.game) {
            broadcastGameStart(joinedRoom);
          }
          if (typeof ack === 'function') {
            const plainRoom = toPlainRoom(joinedRoom);
            ack({ ok: true, roomId: plainRoom.roomId, players: plainRoom.players, readyPlayers: plainRoom.readyPlayers, game: plainRoom.game });
          }
        } else {
          if (typeof ack === 'function') ack({ ok: true, waiting: true, players: [], readyPlayers: [] });
        }
      } catch (err) {
        console.error('joinRoom error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('playerChoice', (payload = {}, ack) => {
      try {
        const { roomId, playerId, choice } = payload;
        const room = manager.getRoom(roomId);
        const player = manager.getPlayer(playerId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        manager.makeChoice(roomId, playerId, choice);

        const updatedRoom = manager.getRoom(roomId);
        broadcastGameUpdate(updatedRoom);
        if (manager.isGameFinished(roomId)) {
          manager.settleGameOnChain(room.game.gameId);
          broadcastGameOver(updatedRoom);
          room.clearReady();
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

        if (typeof room.markReady === 'function') {
          room.markReady(playerId);
        }

        const plainRoom = toPlainRoom(room);
        socket.emit('returnRoom', { room: plainRoom });

        const everyoneReady = typeof room.isEveryoneReady === 'function' ? room.isEveryoneReady() : false;
        const roomFull = typeof room.isPlayerFull === 'function'
          ? room.isPlayerFull()
          : Array.isArray(room.players) && room.players.length >= 3;
        const canStart = roomFull && everyoneReady;

        if (canStart) {
          manager.clearGame(roomId);
          broadcastRoomUpdate(room);
          manager.startGame(roomId);
          broadcastGameStart(room);
        } else {
          broadcastRoomUpdate(room);
        }

        if (typeof ack === 'function') {
          ack({
            ok: true,
            waiting: !canStart,
            readyPlayers: plainRoom.readyPlayers,
            roomFull,
            everyoneReady
          });
        }
      } catch (err) {
        console.error('continuePlay error', err);
        if (typeof ack === 'function') ack({ ok: false, error: err.message });
      }
    });

    socket.on('leaveRoom', (payload = {}, ack) => {
      try {
        const { roomId, playerId } = payload || {};
        if (!roomId) return ack && ack({ ok: false, error: 'missing roomId' });

        const room = manager.getRoom(roomId);
        if (!room) return ack && ack({ ok: false, error: 'room not found' });
        const player = manager.getPlayer(playerId);
        if (!player) return ack && ack({ ok: false, error: 'player not in room' });

        manager.leaveRoom(roomId, player.playerId);
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
