// ----------------------
// 环境变量 & 依赖加载
// ----------------------
const express = require('express');
const {Web3} = require('web3');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

// ----------------------
// 初始化Express应用
// ----------------------
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ----------------------
// 中间件配置
// ----------------------
app.use(cors());
app.use(express.json({ limit: '10mb' })); // JSON请求体解析
app.use(express.urlencoded({ extended: true }));
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); // 区块链网络地址配置

// ----------------------
// socket.io 初始化
// ----------------------
// 创建 http server 并挂载 socket.io，允许跨域（按需调整 origin）
const server = http.createServer(app);
const { initSocket } = require('./sockets/socket');
initSocket(server);

// ----------------------
// chaincode api
// ----------------------
// const accountPrivateKey = process.env.PRIVATE_KEY || '55fbb278f498dd7499a6fcd78dfff988cc03feb6804ad030a56d8da79d1803ba'; 
const accountPrivateKey = '0xa4a7ad78af1a98b0d403121aa00234f1f473fbdf9af8dce2a70697a2015ba7d8'; // 目前需要手动配置为本地私钥
const account = web3.eth.accounts.privateKeyToAccount(accountPrivateKey);
web3.eth.accounts.wallet.add(account);
web3.eth.defaultAccount = account.address;

const contractCompiled= require('../../chaincode/build/contracts/HelloWorld.json'); 
const contractABI = contractCompiled.abi;
const contractAddress = '0xc62136a2987a3d99078f7E41fDd4cBf1a2E39ed6'; // 目前需要手动替换为你的 HelloWorld 合约地址

// 创建合约实例:cite[10]
const helloWorldContract = new web3.eth.Contract(contractABI, contractAddress);


app.get('/get-message', async (req, res) => {
  try {
    // 调用合约的 getMessage 方法:cite[10]
    const message = await helloWorldContract.methods.getMessage().call();
    res.json({ message: message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/set-message', async (req, res) => {
  const newMessage = req.body.newMessage;
  if (!newMessage) {
    return res.status(400).json({ error: 'New message is required' });
  }
  try {
    // 估算 Gas 消耗:cite[1]
    const gas = await helloWorldContract.methods.setMessage(newMessage).estimateGas({ from: account.address });
    // 发送交易:cite[1]:cite[10]
    const receipt = await helloWorldContract.methods.setMessage(newMessage).send({
      from: account.address,
      gas: gas
    });
    res.json({ 
      success: true, 
      transactionHash: receipt.transactionHash,
      receiptInfo: receipt.gasUsed.toString(),
      newMessage: newMessage 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// 开启Swagger文档
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec)
);

// ----------------------
// 路由注册
// ----------------------
const gameControlRoutes = require('./routes/gameControl.routes')

// 路由挂载
app.use('/api/gameControl',gameControlRoutes);

// ----------------------
// 健康检查端点
// ----------------------
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// ----------------------
// 服务启动
// ----------------------
const startServer = async () => {
  
  server.listen(PORT, () => {
    console.log(`
      Server running in ${NODE_ENV} mode
      http://localhost:${PORT}
      ${new Date().toLocaleString()}
    `);
  });
};

startServer();