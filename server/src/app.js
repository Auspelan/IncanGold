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

// ----------------------
// socket.io 初始化
// ----------------------
// 创建 http server 并挂载 socket.io，允许跨域（按需调整 origin）
const server = http.createServer(app);
const { initSocket } = require('./sockets/socket');
initSocket(server);


// 开启Swagger文档
app.use('/api-docs', 
  swaggerUi.serve, 
  swaggerUi.setup(swaggerSpec)
);


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