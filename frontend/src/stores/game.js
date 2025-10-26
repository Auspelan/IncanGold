import { defineStore } from 'pinia'
import { initSocket, getSocket, on, safeEmit } from '../socket'

function normalizePlayer(raw) {
  if (!raw) return null
  return {
    playerId: raw.playerId,
    playerName: raw.playerName,
    goldInCamp: raw.goldInCamp ?? 0,
    goldCarried: raw.goldCarried ?? 0,
    isOnRoad: Boolean(raw.isOnRoad),
    position: raw.position ?? 0,
    hasMadeChoice: Boolean(raw.hasMadeChoice),
    choice: raw.choice ?? null
  }
}

function normalizePlayers(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizePlayer)
}

function normalizeGame(raw) {
  if (!raw) {
    return {
      gameId: null,
      roomId: null,
      currentRound: 0,
      currentStep: 0,
      trapEncountered: false,
      roadGolds: [],
      players: [],
      isGameFinished: false,
      finalRankings: []
    }
  }
  return {
    gameId: raw.gameId ?? null,
    roomId: raw.roomId ?? null,
    currentRound: raw.currentRound ?? 0,
    currentStep: raw.currentStep ?? 0,
    trapEncountered: Boolean(raw.trapEncountered),
    roadGolds: Array.isArray(raw.roadGolds) ? [...raw.roadGolds] : [],
    players: normalizePlayers(raw.players),
    isGameFinished: Boolean(raw.isGameFinished),
    finalRankings: Array.isArray(raw.finalRankings) ? [...raw.finalRankings] : []
  }
}

function normalizeRoom(raw) {
  if (!raw) {
    return {
      roomId: null,
      players: [],
      readyPlayers: [],
      game: normalizeGame(null)
    }
  }
  return {
    roomId: raw.roomId ?? null,
    players: normalizePlayers(raw.players),
    readyPlayers: Array.isArray(raw.readyPlayers) ? [...raw.readyPlayers] : [],
    game: normalizeGame(raw.game)
  }
}

function initialState() {
  return {
    socketReady: false,
    isConnected: false,
    connectionError: null,
    phase: 'lobby', // 'lobby' | 'room' | 'game' | 'result'
    playerId: null,
    playerName: '',
    entranceFee: 100,
    roomId: null,
    roomPlayers: [],
    roomReadyPlayers: [],
    game: normalizeGame(null),
    finalResults: [],
    isJoining: false,
    isQueued: false,
    hasPendingChoice: false,
    waitingForOthers: false,
    gameStartTimer: null
  }
}

export const useGameStore = defineStore('game', {
  state: initialState,
  getters: {
    selfPlayer(state) {
      return state.game.players.find(p => p.playerId === state.playerId) || null
    },
    otherPlayers(state) {
      return state.game.players.filter(p => p.playerId !== state.playerId)
    },
    pathTiles(state) {
      const road = state.game.roadGolds || []
      return road.slice(1).map((gold, idx) => ({
        position: idx + 1,
        gold
      }))
    }
  },
  actions: {
    initSocket() {
      if (this.socketReady) return
      initSocket()
      this.socketReady = true

      on('connect', () => {
        const socket = getSocket()
        this.playerId = socket?.id ?? null
        this.isConnected = true
        this.connectionError = null
      })

      on('disconnect', () => {
        this.isConnected = false
      })

      on('connect_error', (err) => {
        this.connectionError = err?.message ?? '连接失败'
        this.isConnected = false
      })

      on('pong', () => {
        // keep-alive acknowledgement
      })

      on('roomAssign', ({ room }) => {
        this.clearGameStartTimer()
        this.isQueued = false
        this.applyRoomSnapshot(room)
        this.phase = 'room'
      })

      on('roomUpdate', ({ room }) => {
        this.clearGameStartTimer()
        this.applyRoomSnapshot(room)
        if (this.phase !== 'game' && this.phase !== 'result') {
          this.phase = 'room'
        }
      })

      on('gameStart', ({ game }) => {
        this.finalResults = []
        this.applyGameSnapshot(game)
        this.roomReadyPlayers = (game.players || []).map(p => p.playerId)
        this.phase = 'room'
        this.scheduleGameStart()
      })

      on('gameUpdate', ({ game }) => {
        this.clearGameStartTimer()
        this.applyGameSnapshot(game)
        this.phase = 'game'
      })

      on('gameOver', ({ finalResults }) => {
        this.finalResults = Array.isArray(finalResults) ? finalResults.slice() : []
        this.phase = 'result'
        this.waitingForOthers = false
        this.hasPendingChoice = false
      })

      on('returnRoom', (payload = {}) => {
        this.isQueued = false
        this.finalResults = []
        this.hasPendingChoice = false
        this.waitingForOthers = false
        this.clearGameStartTimer()
        if (payload.room) {
          this.applyRoomSnapshot(payload.room)
        } else if (this.game && this.game.players.length) {
          this.roomPlayers = [...this.game.players]
        }
        this.phase = 'room'
      })

      on('returnLobby', () => {
        const keepName = this.playerName
        const keepFee = this.entranceFee
        this.clearGameStartTimer()
        this.$reset()
        this.playerName = keepName
        this.entranceFee = keepFee
      })
    },

    applyRoomSnapshot(raw) {
      if (!raw) return
      const room = normalizeRoom(raw)
      if (!room.roomId) return
      this.roomId = room.roomId
      this.roomPlayers = room.players
      this.roomReadyPlayers = room.readyPlayers
      this.isQueued = false
      const hasActiveGame = room.game && room.game.gameId && !room.game.isGameFinished
      if (hasActiveGame) {
        this.applyGameSnapshot(room.game)
      } else {
        this.game = normalizeGame(null)
        if (this.phase !== 'game' && this.phase !== 'result') {
          this.phase = 'room'
        }
      }
    },

    applyGameSnapshot(rawGame) {
      const game = normalizeGame(rawGame)
      this.game = game
      if (game.roomId) {
        this.roomId = game.roomId
      }
      this.roomPlayers = game.players
      this.roomReadyPlayers = []
      this.hasPendingChoice = false
      this.waitingForOthers = false
    },

    scheduleGameStart(delay = 800) {
      this.clearGameStartTimer()
      this.gameStartTimer = setTimeout(() => {
        this.phase = 'game'
        this.roomReadyPlayers = []
        this.gameStartTimer = null
      }, delay)
    },

    clearGameStartTimer() {
      if (this.gameStartTimer) {
        clearTimeout(this.gameStartTimer)
        this.gameStartTimer = null
      }
    },

    joinRoom() {
      if (!this.socketReady) this.initSocket()
      if (!this.playerName) return

      const socket = getSocket()
      const playerId = this.playerId || socket?.id
      if (!playerId) return

      this.isJoining = true
      this.connectionError = null

      safeEmit('joinRoom', {
        playerId,
        playerName: this.playerName,
        entranceFee: Number(this.entranceFee) || 0
      }, (ack) => {
        this.isJoining = false

        if (!ack?.ok) {
          this.connectionError = ack?.error || '匹配失败'
          this.isQueued = false
          this.phase = 'lobby'
          return
        }

        this.connectionError = null

        if (ack.waiting) {
          this.isQueued = true
          this.roomId = ack.roomId || null
          this.roomPlayers = Array.isArray(ack.players) ? normalizePlayers(ack.players) : []
          this.roomReadyPlayers = Array.isArray(ack.readyPlayers) ? [...ack.readyPlayers] : []
          this.game = normalizeGame(null)
          this.phase = 'room'
        } else {
          this.isQueued = false
          const roomPayload = {
            roomId: ack.roomId,
            players: ack.players,
            readyPlayers: ack.readyPlayers,
            game: ack.game
          }
          this.applyRoomSnapshot(roomPayload)
          if (roomPayload.game && roomPayload.game?.gameId) {
            this.phase = 'room'
          } else {
            this.phase = 'room'
          }
        }
      })
    },

    choose(choice) {
      if (this.phase !== 'game') return
      if (!this.roomId || !this.playerId) return
      if (this.hasPendingChoice) return

      this.hasPendingChoice = true
      this.waitingForOthers = true

      safeEmit('playerChoice', {
        roomId: this.roomId,
        playerId: this.playerId,
        choice
      }, (ack) => {
        if (!ack?.ok) {
          this.connectionError = ack?.error || '操作失败'
          this.hasPendingChoice = false
          this.waitingForOthers = false
        }
      })
    },

    chooseAdvance() {
      this.choose('advance')
    },

    chooseReturn() {
      this.choose('return')
    },

    continueGame() {
      if (!this.roomId || !this.playerId) return
      safeEmit('continuePlay', {
        roomId: this.roomId,
        playerId: this.playerId
      }, (ack) => {
        if (!ack?.ok) {
          this.connectionError = ack?.error || '继续游戏失败'
        }
      })
    },

    leaveRoom() {
      const keepName = this.playerName
      const keepFee = this.entranceFee

      if (!this.roomId || !this.playerId) {
        this.clearGameStartTimer()
        this.$reset()
        this.playerName = keepName
        this.entranceFee = keepFee
        return
      }

      safeEmit('leaveRoom', {
        roomId: this.roomId,
        playerId: this.playerId
      }, (ack) => {
        if (!ack?.ok) {
          this.connectionError = ack?.error || '离开房间失败'
        }
        this.clearGameStartTimer()
        this.$reset()
        this.playerName = keepName
        this.entranceFee = keepFee
      })
    },

    $reset() {
      const socketConnected = Boolean(getSocket()?.connected)
      const socketId = getSocket()?.id ?? null
      this.clearGameStartTimer()
      const next = initialState()
      Object.assign(this, next)
      this.socketReady = true
      this.isConnected = socketConnected
      this.playerId = socketId
    }
  }
})
