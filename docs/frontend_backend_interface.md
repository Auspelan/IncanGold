# 前后端接口
[飞书云文档](https://icn5bnei7pa7.feishu.cn/wiki/CvlLwbtLsifECgkl1TGcOUeonQe)

## 路由接口

### POST /api/usr/login
上传用户私钥和用户名

#### 请求格式

```json
{
    "privateKey": "string",
    "usrName": "string"
}
```


#### 返回格式

```json
{
}
```


## Socket接口

### 事件处理流程
用户操作 → 触发Vue组件事件 → Store Action →  状态变量更新 + Socket发送所需变量给后端 → 后端处理 → Socket发送更新后的状态变量给前端 → UI更新

### 响应模式说明
- **立即确认**: 后端在 `socket.on` 内部立即发送操作确认
- **异步更新**: 后端在游戏逻辑处理完成后，通过房间广播发送状态更新
- **房间广播**: 使用 `io.to(roomId).emit()` 向房间内所有玩家同步状态

### 示例：
前端发送示例：

```javascript
// 用户操作前端界面触发 chooseAdvance() 事件
chooseAdvance() {
    // 更新前端状态变量
    this.hasChosen = true
    this.choice = 'advance'

    // 通过 socket 发送后端所需变量, 事件名为 playerChoice
    this.socket.emit('playerChoice', {
        roomId: this.roomId,
        playerId: this.playerId,
        choice: 'advance',
    })
}
```

后端接收示例：
```javascript
socket.on('playerChooseChoice', (data) => {
    // 接受 data 传递的变量用于更新后端的相关变量
    ...

    // 可以在函数体内同步响应当前玩家的例如请求成功的信息
    // 然后在函数体外通过 Socket.io 的房间广播异步响应，并传递用于更新所有玩家的前端界面的状态变量
    socket.emit(playerActionResult), {
        success: true,
        choice: data.choice
    }
    
    ...
})
```

### 前端 → 后端事件接口

#### joinRoom
玩家请求加入游戏房间

```json
{
    "playerName": "string",
    "playerId": "string",
    "entranceFee": "number"
}
```

#### playerChoice
玩家做出选择（前进/返回）

```json
{
    "roomId": "string",
    "playerId": "string", 
    "choice": "advance" | "return",
}
```

#### continuePlay
结束游戏后，玩家请求开始新一轮游戏

```json
{
    "roomId": "string",
    "playerId": "string"
}
```

#### leaveRoom
结束游戏后，玩家请求离开游戏房间

```json
{
    "roomId": "string",
    "playerId": "string"
}
```

### 后端 → 前端事件接口

#### roomAssign
匹配成功后分配房间
```json
{
    "room": {
        "roomId": "string",
        "players": "Player[]",
        "game": "Game" || null,
        "createdAt": "time"
    },
}
```

#### roomUpdate
房间内其他玩家操作后，房间状态更新
```json
{
    "room": {
        "roomId": "string",
        "players": "Player[]",
        "game": "Game" || null,
        "createdAt": "time"
    },
}
```

#### gameStart
所有玩家进入房间后开始游戏
```json
{
    "game": "Game"
}
```

#### gameUpdate
玩家都做出选择后，游戏状态更新

```json
{
    "game": "Game"
}
```

#### gameOver
游戏结束，进入结算阶段
```json
{
    "finalResults": [
        {
            "rank": "number",
            "playerId": "string",
            "playerName": "string",
            "finalGold": "number",
            "etherChange": "number",
        }
    ]
}
```

### returnRoom
若选择继续游戏，则重新回到房间，等待新一轮游戏开启
```json
{

}
```

### returnLobby
若选择离开房间，则回到大厅视图，结束游戏
```json
{
    
}
