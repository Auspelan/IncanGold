import { defineStore } from 'pinia'
import { io } from 'socket.io-client'

// 🎭 Mock 模式配置
const USE_MOCK = true  // 设置为 false 则连接真实后端
const MOCK_DELAY = 1500  // Mock 操作延迟时间（毫秒）

export const useGameStore = defineStore('game', {
  // Initial States
  state: () => ({
    socket: null,
    phase: 'lobby', // 'lobby' | 'game' | 'result'
    playerId: null,
    playerName: '',
    roomId: null,
    
    // 游戏状态
    round: 0,
    maxRounds: 3,
    gameStage: 'selection',
    
    // 玩家信息
    players: [],
    
    // 当前回合状态
    position: 0,
    campGold: 0,
    handGold: 0,
    trapNum: 0,
    pathGold: [],
    
    // 选择状态
    hasChosen: false,
    waitingForOthers: false,
    
    // Mock 模式专用状态
    aiPlayers: [],  // AI 玩家状态
    currentTile: null,  // 当前地块类型（'reward' | 'trap'）
    maxReward: 20  // 最大奖励值
  }),
  
  actions: {
    
    // Reset game state to initial values
    reset() {
      this.phase = 'lobby'
      this.roomId = null
      this.round = 0
      this.position = 0
      this.campGold = 0
      this.handGold = 0
      this.players = []
    },
    
    // ===== 以下为新增的 Mock 模式 Actions =====
    
    // 初始化 Socket（Mock 或真实）
    initSocket() {
      if (USE_MOCK) {
        console.log('🎭 Mock 模式启动 - 模拟三人博弈')
        this.playerId = 'player-1'
        return
      }
      
      // 真实 Socket.IO 连接（预留接口）
      this.socket = io('http://localhost:5000')
      this.socket.on('connect', () => {
        this.playerId = this.socket.id
      })
      // ...其他 Socket 事件监听
    },
    
    // 加入房间
    joinRoom(playerName, entranceFee) {
      this.playerName = playerName
      
      if (USE_MOCK) {
        this._mockJoinRoom(playerName, entranceFee)
        return
      }
      
      // 真实后端接口（预留）
      this.socket.emit('joinRoom', { playerName, entranceFee })
    },
    
    // 选择前进
    chooseAdvance() {
      if (USE_MOCK) {
        this._mockPlayerChoice('advance')
        return
      }
      
      this.socket.emit('playerChoice', { 
        roomId: this.roomId,
        choice: 'advance' 
      })
      this.hasChosen = true
    },
    
    // 选择返回营地
    chooseReturn() {
      if (USE_MOCK) {
        this._mockPlayerChoice('return')
        return
      }
      
      this.socket.emit('playerChoice', { 
        roomId: this.roomId,
        choice: 'return' 
      })
      this.hasChosen = true
    },
    
    // ============ Mock 模式内部实现 ============
    
    // Mock: 加入房间
    _mockJoinRoom(playerName, entranceFee) {
      console.log(`[Mock] ${playerName} 加入游戏，入场费: ${entranceFee}`)
      
      this.roomId = 'MOCK-ROOM-' + Math.random().toString(36).substr(2, 4).toUpperCase()
      
      // 初始化三名玩家
      this.players = [
        { 
          id: 'player-1', 
          name: playerName, 
          campGold: 100, 
          handGold: 0, 
          position: 0, 
          inCamp: true,
          choice: null  // 当前回合的选择
        },
        { 
          id: 'player-2', 
          name: 'AI 玩家 Alpha', 
          campGold: 100, 
          handGold: 0, 
          position: 0, 
          inCamp: true,
          choice: null,
          isAI: true
        },
        { 
          id: 'player-3', 
          name: 'AI 玩家 Beta', 
          campGold: 100, 
          handGold: 0, 
          position: 0, 
          inCamp: true,
          choice: null,
          isAI: true
        }
      ]
      
      // 2秒后自动开始游戏
      setTimeout(() => {
        this._mockGameStart()
      }, 2000)
    },
    
    // Mock: 游戏开始
    _mockGameStart() {
      console.log('[Mock] 🎮 游戏开始！')
      this.phase = 'game'
      this.round = 1
      this.campGold = 100
      this.handGold = 0
      this.position = 0
      this.trapNum = 0
      this.pathGold = Array(10).fill(10)  // 10个位置的路径
      this.gameStage = 'selection'
      
      // 重置玩家状态
      this.players.forEach(player => {
        player.campGold = 100
        player.handGold = 0
        player.position = 0
        player.inCamp = true
        player.choice = null
      })
    },
    
    // Mock: 玩家做出选择
    _mockPlayerChoice(choice) {
      console.log(`[Mock] 你选择了: ${choice === 'advance' ? '前进' : '返回营地'}`)
      
      this.hasChosen = true
      this.waitingForOthers = true
      
      // 记录玩家选择
      const player = this.players.find(p => p.id === 'player-1')
      player.choice = choice
      
      // AI 玩家智能决策
      setTimeout(() => {
        this._mockAIDecisions()
      }, MOCK_DELAY)
    },
    
    // Mock: AI 玩家决策
    _mockAIDecisions() {
      this.players.forEach(player => {
        if (!player.isAI) return
        
        // AI 决策逻辑
        let shouldReturn = false
        
        // 策略1: 手中金币超过50，有50%概率返回
        if (player.handGold > 50 && Math.random() < 0.5) {
          shouldReturn = true
        }
        
        // 策略2: 已经有1个陷阱，有70%概率返回
        if (this.trapNum >= 1 && Math.random() < 0.7) {
          shouldReturn = true
        }
        
        // 策略3: 位置超过5，有30%概率返回
        if (player.position >= 5 && Math.random() < 0.3) {
          shouldReturn = true
        }
        
        // 策略4: 第3轮最后阶段，倾向于返回
        if (this.round === 3 && player.position >= 3 && Math.random() < 0.6) {
          shouldReturn = true
        }
        
        player.choice = shouldReturn ? 'return' : 'advance'
        
        console.log(`[Mock] ${player.name} 选择: ${player.choice === 'advance' ? '前进' : '返回营地'}`)
      })
      
      // 所有玩家选择完毕，进入判定阶段
      setTimeout(() => {
        this._mockJudgmentPhase()
      }, MOCK_DELAY)
    },
    
    // Mock: 判定阶段
    _mockJudgmentPhase() {
      console.log('[Mock] ⚖️ 判定阶段开始')
      this.gameStage = 'judgment'
      this.waitingForOthers = false
      
      // 1. 处理返回营地的玩家
      const returningPlayers = this.players.filter(p => p.choice === 'return' && !p.inCamp)
      const advancingPlayers = this.players.filter(p => p.choice === 'advance')
      
      if (returningPlayers.length > 0) {
        this._mockHandleReturningPlayers(returningPlayers)
      }
      
      // 2. 检查是否还有玩家在路上
      if (advancingPlayers.length === 0) {
        console.log('[Mock] 所有玩家都返回营地，回合结束')
        setTimeout(() => {
          this._mockRoundSettlement()
        }, MOCK_DELAY)
        return
      }
      
      // 3. 判定下一地块
      setTimeout(() => {
        this._mockDrawTile(advancingPlayers)
      }, MOCK_DELAY)
    },
    
    // Mock: 处理返回营地的玩家
    _mockHandleReturningPlayers(returningPlayers) {
      console.log(`[Mock] ${returningPlayers.length} 名玩家返回营地`)
      
      // 计算路径上的总金币
      let totalPathGold = 0
      returningPlayers.forEach(player => {
        for (let i = 0; i <= player.position; i++) {
          totalPathGold += this.pathGold[i]
        }
      })
      
      // 平分金币
      const goldPerPlayer = Math.floor(totalPathGold / returningPlayers.length)
      const remainder = totalPathGold % returningPlayers.length
      
      returningPlayers.forEach((player, index) => {
        const bonus = index < remainder ? 1 : 0
        const totalGold = goldPerPlayer + bonus + player.handGold
        
        player.campGold += totalGold
        player.handGold = 0
        player.position = 0
        player.inCamp = true
        
        console.log(`[Mock] ${player.name} 获得 ${totalGold} 金币，营地总金币: ${player.campGold}`)
        
        // 更新主玩家状态
        if (player.id === 'player-1') {
          this.campGold = player.campGold
          this.handGold = 0
          this.position = 0
        }
      })
      
      // 清空路径金币
      returningPlayers.forEach(player => {
        for (let i = 0; i <= player.position; i++) {
          this.pathGold[i] = 0
        }
      })
    },
    
    // Mock: 抽取地块
    _mockDrawTile(advancingPlayers) {
      // 30%概率是陷阱，70%概率是奖励
      const isTrap = Math.random() < 0.3
      this.currentTile = isTrap ? 'trap' : 'reward'
      
      if (isTrap) {
        this._mockHandleTrap(advancingPlayers)
      } else {
        this._mockHandleReward(advancingPlayers)
      }
    },
    
    // Mock: 处理陷阱
    _mockHandleTrap(advancingPlayers) {
      this.trapNum++
      console.log(`[Mock] ⚠️ 遇到陷阱！当前陷阱数: ${this.trapNum}`)
      
      if (this.trapNum >= 2) {
        // 触发第二个陷阱，所有玩家丢失金币
        console.log('[Mock] 💥 触发第二个陷阱！所有玩家丢失携带的金币')
        
        advancingPlayers.forEach(player => {
          console.log(`[Mock] ${player.name} 丢失 ${player.handGold} 金币`)
          player.handGold = 0
          player.position = 0
          player.inCamp = true
          
          if (player.id === 'player-1') {
            this.handGold = 0
            this.position = 0
          }
        })
        
        setTimeout(() => {
          this._mockRoundSettlement()
        }, MOCK_DELAY * 2)
      } else {
        // 第一个陷阱，继续游戏
        setTimeout(() => {
          this._mockNextSelection()
        }, MOCK_DELAY * 2)
      }
    },
    
    // Mock: 处理奖励
    _mockHandleReward(advancingPlayers) {
      const totalReward = Math.floor(Math.random() * this.maxReward) + 10
      const rewardPerPlayer = Math.floor(totalReward / advancingPlayers.length)
      const remainder = totalReward % advancingPlayers.length
      
      console.log(`[Mock] 💎 获得奖励：总计 ${totalReward} 金币`)
      
      advancingPlayers.forEach((player, index) => {
        const bonus = index < remainder ? 1 : 0
        const playerReward = rewardPerPlayer + bonus
        
        player.handGold += playerReward
        player.position++
        player.inCamp = false
        
        console.log(`[Mock] ${player.name} 获得 ${playerReward} 金币，手中金币: ${player.handGold}`)
        
        if (player.id === 'player-1') {
          this.handGold = player.handGold
          this.position = player.position
        }
      })
      
      // 未整除的部分留在当前地块
      if (remainder > 0 && advancingPlayers.length > 0) {
        const currentPos = advancingPlayers[0].position
        this.pathGold[currentPos] = remainder
      }
      
      setTimeout(() => {
        this._mockNextSelection()
      }, MOCK_DELAY * 2)
    },
    
    // Mock: 进入下一个选择阶段
    _mockNextSelection() {
      console.log('[Mock] 🎯 进入选择阶段')
      this.gameStage = 'selection'
      this.hasChosen = false
      this.waitingForOthers = false
      
      // 重置玩家选择
      this.players.forEach(player => {
        player.choice = null
      })
    },
    
    // Mock: 回合结算
    _mockRoundSettlement() {
      console.log(`[Mock] 📊 第 ${this.round} 轮结算`)
      this.gameStage = 'settlement'
      
      // 将所有手中金币转移到营地
      this.players.forEach(player => {
        if (player.handGold > 0) {
          player.campGold += player.handGold
          console.log(`[Mock] ${player.name} 将 ${player.handGold} 金币转移到营地`)
          player.handGold = 0
        }
        player.position = 0
        player.inCamp = true
        
        if (player.id === 'player-1') {
          this.campGold = player.campGold
          this.handGold = 0
          this.position = 0
        }
      })
      
      setTimeout(() => {
        if (this.round >= this.maxRounds) {
          this._mockGameOver()
        } else {
          this._mockNewRound()
        }
      }, MOCK_DELAY * 2)
    },
    
    // Mock: 新回合开始
    _mockNewRound() {
      this.round++
      console.log(`[Mock] 🔄 开始第 ${this.round} 轮`)
      
      this.position = 0
      this.trapNum = 0
      this.pathGold = Array(10).fill(0)
      this.gameStage = 'selection'
      this.hasChosen = false
      this.waitingForOthers = false
      
      this.players.forEach(player => {
        player.position = 0
        player.handGold = 0
        player.inCamp = true
        player.choice = null
      })
    },
    
    // Mock: 游戏结束
    _mockGameOver() {
      console.log('[Mock] 🏁 游戏结束！')
      this.phase = 'result'
      
      // 最终结算：第三名将入场费转给第一名
      const sortedPlayers = [...this.players].sort((a, b) => b.campGold - a.campGold)
      
      console.log('[Mock] 最终排名：')
      sortedPlayers.forEach((player, index) => {
        console.log(`  ${index + 1}. ${player.name}: ${player.campGold} 金币`)
      })
      
      // 第三名给第一名转账
      const entranceFee = 100
      sortedPlayers[2].campGold -= entranceFee
      sortedPlayers[0].campGold += entranceFee
      
      console.log(`[Mock] ${sortedPlayers[2].name} 将 ${entranceFee} 金币转给 ${sortedPlayers[0].name}`)
      
      // 更新排序后的玩家列表
      this.players = sortedPlayers
      
      // 更新主玩家状态
      const mainPlayer = sortedPlayers.find(p => p.id === 'player-1')
      if (mainPlayer) {
        this.campGold = mainPlayer.campGold
      }
    }
  }
})