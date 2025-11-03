# IncanGold chaincode

## 运行环境
- Truffle v5.8.1
- Ganache UI v2.7.1：安装目录https://github.com/ConsenSys-archive/ganache-ui/releases

## 安装依赖库
```bash
npm install
npm install truffle-assertions
```

## 运行
- 运行Gannache UI（端口配置应改为8545）
- HARDFOR策略应修改为London
```bash
truffle compile
truffle migrate --network development
```
