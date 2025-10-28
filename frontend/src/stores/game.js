import { defineStore } from 'pinia'
import { initSocket, getSocket, on, safeEmit } from '../socket'

const EVENT_MESSAGE_BUILDERS = {
  reward: ({ gained = 0 } = {}) => gained > 0
    ? `探险有成，获得 ${gained} 个金币！`
    : '继续前进，暂未发现宝藏。',
  advance: () => '继续深入遗迹……',
  return: ({ gained = 0 } = {}) => gained > 0
    ? `返回营地并带回 ${gained} 个金币。`
    : '返回营地，暂未带回金币。',
  'trap-first': () => '前方出现陷阱，但你安全通过！',
  'trap-second': ({ lost = 0 } = {}) => lost > 0
    ? `遭遇第二个陷阱，损失 ${lost} 个金币并被迫返回营地！`
    : '遭遇第二个陷阱，被迫返回营地！',
  'round-end': () => '本轮结束，准备下一轮。',
  'round-start': ({ round } = {}) => round
    ? `第 ${round} 轮开始，祝你好运！`
    : '新一轮开始，祝你好运！'
}

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
      finalRankings: [],
      lastEventTick: 0
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
    finalRankings: Array.isArray(raw.finalRankings) ? [...raw.finalRankings] : [],
    lastEventTick: Number.isFinite(raw.lastEventTick) ? raw.lastEventTick : 0
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
    gameStartTimer: null,
    eventMessage: '',
    messageTimer: null,
    lastHandledEventTick: 0
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
        if (!this.eventMessage) {
          this.setEventMessage('已加入房间，等待其他玩家...', 2000)
        }
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
        this.setEventMessage('本局结束，查看结算结果。', 2500)
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
        if (this.roomPlayers.length < 3) {
          this.setEventMessage(`房间人数不足 (${this.roomPlayers.length}/3)，等待其他玩家加入...`, 3000)
        } else if (this.roomReadyPlayers.length < this.roomPlayers.length) {
          this.setEventMessage('等待其他玩家确认继续游戏...', 2500)
        }
      })

      on('returnLobby', () => {
        const keepName = this.playerName
        const keepFee = this.entranceFee
        this.clearGameStartTimer()
        this.setEventMessage('', 0)
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
        this.lastHandledEventTick = 0
        if (this.phase !== 'game' && this.phase !== 'result') {
          this.phase = 'room'
        }
      }
    },

    applyGameSnapshot(rawGame) {
      const previousGameId = this.game?.gameId || null
      const game = normalizeGame(rawGame)
      const incomingTick = rawGame?.lastEventTick ?? 0
      this.game = game
      if (game.roomId) {
        this.roomId = game.roomId
      }
      this.roomPlayers = game.players
      this.roomReadyPlayers = []
      const selfSnapshot = game.players.find(p => p.playerId === this.playerId) || null
      const awaitingResolution = Boolean(selfSnapshot?.hasMadeChoice)
      this.hasPendingChoice = awaitingResolution
      this.waitingForOthers = awaitingResolution
      if (!game.gameId) {
        this.lastHandledEventTick = incomingTick
      } else if (game.gameId !== previousGameId) {
        this.lastHandledEventTick = incomingTick
      }
      this.handleGameEvent(rawGame?.lastEvent, rawGame?.lastEventByPlayer, rawGame)
    },

    scheduleGameStart(delay = 800) {
      this.clearGameStartTimer()
      if (!this.eventMessage) {
        this.setEventMessage('玩家已准备完毕，游戏即将开始...', 1500)
      }
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

    handleGameEvent(event, details = {}, rawGame = null) {
      const selfDetail = details?.[this.playerId] || null
      const incomingTick = (selfDetail && Number.isFinite(selfDetail.tick)) ? selfDetail.tick : (rawGame?.lastEventTick ?? 0)

      if (!event) {
        if ((rawGame?.currentStep ?? 0) === 0) {
          this.setEventMessage('', 0)
        }
        if (incomingTick > this.lastHandledEventTick) {
          this.lastHandledEventTick = incomingTick
        }
        return
      }

      if (!incomingTick || incomingTick <= this.lastHandledEventTick) {
        return
      }

      if (!selfDetail) {
        this.lastHandledEventTick = incomingTick
        return
      }

      const type = selfDetail.type || event
      const builder = EVENT_MESSAGE_BUILDERS[type] || EVENT_MESSAGE_BUILDERS[event]
      if (!builder) {
        this.lastHandledEventTick = incomingTick
        return
      }
      const context = {
        event,
        game: rawGame,
        playerId: this.playerId
      }
      const message = builder(selfDetail, context)
      if (!message) {
        this.lastHandledEventTick = incomingTick
        return
      }

      const duration = type === 'trap-second' ? 4000
        : type === 'round-end' ? 2000
        : 2500
      this.setEventMessage(message, duration)
      this.lastHandledEventTick = incomingTick
    },

    setEventMessage(message, duration = 2500) {
      this.clearMessageTimer()
      if (!message) {
        this.eventMessage = ''
        return
      }
      this.eventMessage = message
      if (duration > 0) {
        this.messageTimer = setTimeout(() => {
          this.eventMessage = ''
          this.messageTimer = null
        }, duration)
      }
    },

    clearMessageTimer() {
      if (this.messageTimer) {
        clearTimeout(this.messageTimer)
        this.messageTimer = null
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
          this.setEventMessage('已加入房间，等待其他玩家...', 2500)
        } else {
          this.isQueued = false
          const roomPayload = {
            roomId: ack.roomId,
            players: ack.players,
            readyPlayers: ack.readyPlayers,
            game: ack.game
          }
          this.applyRoomSnapshot(roomPayload)
          this.phase = 'room'
        }
      })
    },

    choose(choice) {
      if (this.phase !== 'game') return
      if (!this.roomId || !this.playerId) return
      const player = this.selfPlayer
      if (!player) return

      if (!player.isOnRoad) {
        this.setEventMessage('你已返回营地，等待下一轮开始。', 2500)
        return
      }

      if (player.hasMadeChoice || this.hasPendingChoice) {
        this.setEventMessage('已提交选择，等待其他玩家...', 2000)
        return
      }

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
        } else if (ack.waiting) {
          const waitingMessage = ack.roomFull
            ? '已选择继续游戏，等待其他玩家确认...'
            : '房间人数不足，等待其他玩家加入...'
          this.setEventMessage(waitingMessage, 2500)
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
        this.setEventMessage('', 0)
        this.$reset()
        this.playerName = keepName
        this.entranceFee = keepFee
      })
    },

    $reset() {
      const socketConnected = Boolean(getSocket()?.connected)
      const socketId = getSocket()?.id ?? null
      this.clearGameStartTimer()
      this.clearMessageTimer()
      const next = initialState()
      Object.assign(this, next)
      this.socketReady = true
      this.isConnected = socketConnected
      this.playerId = socketId
    }
  }
})
