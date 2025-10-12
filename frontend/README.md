# 前端界面

## 主要技术栈
- vue.js(component API) + vite
- pinia
- socket.io(client)

## 项目结构
```
frontend/
├── index.html              # HTML 入口（Vite 规范）
├── src/
│   ├── main.js             # 应用入口
│   ├── App.vue             # 根组件
│   ├── stores/
│   │   └── game.js         # 游戏状态管理 (Pinia)
│   ├── views/
│   │   ├── LobbyView.vue   # 大厅视图
│   │   ├── GameView.vue    # 游戏视图
│   │   └── ResultView.vue  # 结果视图
│   └── components/
│       ├── GameStatus.vue      # 游戏状态显示
│       ├── PlayerInfo.vue      # 玩家信息显示
│       ├── GameBoard.vue       # 游戏棋盘
│       └── PlayerActions.vue   # 玩家操作按钮
├── package.json
└── vite.config.js          # Vite 配置
```

## 安装依赖
```bash
cd frontend
npm install
```

## 启动开发服务器
```bash
npm run dev
```
默认运行在 `http://localhost:8080`

## 构建生产版本
```bash
npm run build
```

## Pinia Store 状态变量详细说明

### 连接与身份状态
- `socket`: Socket.IO 客户端实例
- `playerId`: 当前玩家的唯一标识符
- `playerName`: 当前玩家的姓名
- `roomId`: 房间ID标识符
- `entranceFee`: 当前玩家进入房间的入场费

### 游戏阶段控制
- `phase`: 主要游戏阶段 ('lobby' | 'game' | 'result')
  - `lobby`: 大厅等待阶段，等待玩家加入
  - `game`: 游戏进行阶段
  - `result`: 游戏结束结果展示阶段
- `round`: 当前回合数 (1-3)
- `maxRounds`: 最大回合数 (默认3)
- `gameStage`: 游戏内详细阶段 ('selection' | 'judgment' | 'settlement')
  - `selection`: 选择阶段，玩家选择前进或返回
  - `judgment`: 判定阶段，处理地块结果
  - `settlement`: 结算阶段，回合或游戏结束结算

### 玩家个人状态
- `id`: 玩家ID
- `name`: 玩家姓名
- `campGold`: 营地中的安全金币数量
- `handGold`: 手中携带的金币数量
- `position`: 当前玩家在路径上的位置 (0表示营地)
- `inCamp`: 是否在营地
- `choice`: 当前回合选择 ('advance' | 'return' | null)
- `hasChosen`: 当前回合是否已做出选择
- `waitingForOthers`: 是否正在等待其他玩家选择
- `isAI`: 是否为AI玩家 (Mock模式专用)

### 游戏环境状态
- `players`: 所有玩家信息数组，包含：
  - `id`
  - `name`
  - `campGold`
  - `handGold`
  - `position`
  - `inCamp`
  - `choice`
  - `hasChosen`
  - `waitingForOthers`
  - `isAI`
- `trapEncountered`:玩家们目前是否遭遇到过陷阱 (true | false)
- `pathLength`: 路的长度
- `pathGold`: 路上每个位置金币数的数组
- `pathTrap`: 路上是否有陷阱的布尔数组

### 游戏结算状态
- `finalResults`: 结算结果数组，包含
  - `rank`: 当前玩家的名次
  - `playerId`: 玩家 id
  - `playerName`: 玩家姓名
  - `finalGold`: 总金币数
  - `etherChange`: 以太币赢输金额

### Mock模式专用状态
- `aiPlayers`: AI玩家状态数组 (仅Mock模式)
- `currentTile`: 当前抽取的地块类型 ('reward' | 'trap')
- `maxReward`: 单次奖励的最大值

### Actions (游戏操作方法)
TBD:

### Mock模式专用Actions
- `_mockJoinRoom()`: 模拟加入房间
- `_mockGameStart()`: 模拟游戏开始
- `_mockPlayerChoice()`: 模拟玩家选择
- `_mockAIDecisions()`: 模拟AI决策
- `_mockJudgmentPhase()`: 模拟判定阶段
- `_mockHandleReturningPlayers()`: 处理返回营地的玩家
- `_mockDrawTile()`: 模拟抽取地块
- `_mockHandleTrap()`: 处理陷阱逻辑
- `_mockHandleReward()`: 处理奖励逻辑
- `_mockRoundSettlement()`: 回合结算
- `_mockGameOver()`: 游戏结束处理

## 游戏流程
1. **大厅阶段**: 输入名字和入场费，等待3名玩家加入
2. **游戏阶段**: 
   - 选择阶段: 选择前进或返回营地
   - 判定阶段: 显示判定结果（陷阱/奖励）
   - 结算阶段: 回合结算
3. **结果阶段**: 显示最终排名

## 后端配置要求
后端需要运行在 `http://localhost:5000` 并支持上述 Socket.IO 事件接口。

前端通过 `vite.config.js` 中的代理配置将 Socket.IO 请求转发到后端。

## 注意事项
不过暂时还没有实现与后端的 socket 接口的连接，game.js 中的逻辑只是一个简易的 ai 编写的模拟逻辑（我也没仔细看 ai 给两个 ai player 写的具体策略是怎么样的）