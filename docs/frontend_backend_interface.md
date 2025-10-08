# 前后端接口

## 路由接口

### POST /api/usr/login
上传用户私钥和用户名

#### 请求格式

```json
{
    privateKey: string,
    usrName: string
}
```


#### 返回格式

```json
{
}
```


## Socket接口

### joinMatchingQueue
将当前用户加入匹配队列
#### 类型
前端 to 后端
#### 参数格式
```json
{
    playerId: string,
    ...
}
```

### gameStart
匹配成功，开始游戏
#### 类型
后端 to 前端
#### 参数格式
```json
{
    playerId: string,
    ...
}
```