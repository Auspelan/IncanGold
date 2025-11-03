# IncanGold

ZJU区块链短学期课程项目

组员：贺禹勋、李嘉锐、邓俊毅

## 项目介绍

IncanGold是一个基于区块链网络的多人在线策略游戏。玩家可以在探索与返回营地的博弈中获取金币，通过安全带回更多的金币来赢取ETH。

## 运行环境

- Truffle v5.8.1
- Ganache UI v2.7.1：安装目录https://github.com/ConsenSys-archive/ganache-ui/releases
- Node v22.15.1
- npm v10.9.2

## 编译运行

首先启动Ganache UI，将端口配置改为8545，HARDFORK策略修改为London。

编译并部署合约：
```bash
cd chaincode
npm install
truffle compile
# 合约部署后，会输出合约地址，用于后续环境配置
truffle migrate --network development
cd ..
```

配置后端环境变量：

在 `server` 目录下创建 `.env`文件，内容参考如下：
```.env
# Ganache UI运行的区块链网络的RPC URL
RPC_URL = http://127.0.0.1:8545
# 部署合约的地址
CONTRACT_ADDRESS = 0x52e29782E210C470B1293bAbbc269FeFE34A68e4
# Ganache UI中合约OWNER账户的私钥，默认为Ganache UI中第一个账户的私钥
OWNER_PRIVATE_KEY = 0xb94b6c939c7ed234967d1145051f8599378d5da6f81e9eb28a3de3dd9e876e2a
```

启动服务器：
```bash
cd server
npm install
npm start
cd ..
```
启动前端：
```bash
cd frontend
npm install
# 在开发模式下启动前端
npm run dev
# 或者在生产模式下启动前端
npm run build
```


