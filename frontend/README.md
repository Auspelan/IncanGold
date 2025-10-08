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

## Pinia Store
> 这里暂时写了几个必要的状态变量和动作函数，后续可以根据后端代码调整
### State
- `phase`: 当前游戏阶段 ('lobby' | 'game' | 'result')
- `round`: 当前回合数
- `gameStage`: 游戏内阶段 ('selection' | 'judgment' | 'settlement')
- `campGold`: 营地金币
- `handGold`: 手中金币
- `position`: 当前位置
- `trapNum`: 陷阱数量
- `pathGold`: 路径上各位置的金币数组
- `players`: 所有玩家信息数组

### Actions
- `initSocket()`: 初始化 Socket 连接和事件监听
- `joinRoom(playerName, entranceFee)`: 加入游戏房间
- `chooseAdvance()`: 选择前进
- `chooseReturn()`: 选择返回营地
- `restart()`: 重新开始游戏

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