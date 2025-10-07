# IncanGold server

## 运行环境
- NodeJS：安装目录https://nodejs.org/zh-cn

## 安装依赖库
```bash
npm install
npm install dotenv
```

## 运行
```bash
npm start
```

## dotenv Template

```
# /home/zephyr/IncanGold/server/.env

# The address of your deployed contract
CONTRACT_ADDRESS="0x36fDEd6453a5DaA93F5B64c1980C7758a8E6Fe48"

# The private key of the contract OWNER account from Ganache
# In Ganache, click the key icon next to the first account to copy this
OWNER_PRIVATE_KEY="your-ganache-owner-private-key-here"

# The RPC URL for your Ganache client
RPC_URL="http://127.0.0.1:8545"
```

