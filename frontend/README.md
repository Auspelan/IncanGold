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

## 前端界面变量
> 前端界面中需要显示的变量或需要用户输入的变量

### LobbyView
- playerName: string
- playerId: string
- entranceFee: number

### RoomView
- roomId: string

### GameView
- round: number
- trapEncountered: true | false
- pathLength: number
- pathGold: numer array
- pathTrap: bool array
- players: object array (其中当前界面的 player.choice 需要用户输入)

### ResultView
- finalResults: object array