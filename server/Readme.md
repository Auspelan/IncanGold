# IncanGold server

## 运行环境
- NodeJS：安装目录https://nodejs.org/zh-cn

## 安装依赖库
```bash
npm install
```

## 配置环境变量
- 在 `server` 目录下创建 `.env`文件，内容参考如下
```.env
# Ganache UI运行的区块链网络的RPC URL
RPC_URL = http://127.0.0.1:8545
# 部署合约的地址
CONTRACT_ADDRESS = 0x52e29782E210C470B1293bAbbc269FeFE34A68e4
# Ganache UI中合约OWNER账户的私钥
OWNER_PRIVATE_KEY = 0xb94b6c939c7ed234967d1145051f8599378d5da6f81e9eb28a3de3dd9e876e2a
```

## 运行
```bash
npm start
```