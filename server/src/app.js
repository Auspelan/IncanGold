// ----------------------
// 环境变量 & 依赖加载
// ----------------------
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
// const initializeDatabase = require("./db"); // 导入数据库连接

// ----------------------
// 初始化Express应用
// ----------------------
const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ----------------------
// 数据库连接
// ----------------------
// const connectDB = async () => {
//   // Not implemnted
//   let pool = await initializeDatabase();

//   // 示例路由：查询数据
//   app.get("/users", async (req, res) => {
//     try {
//       // 执行 SQL 查询（使用参数化查询防止 SQL 注入）
//       const [rows] = await pool.query("SELECT * FROM user");
//       res.json(rows);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "数据库查询失败" });
//     }
//   });
// }
  // 示例路由：插入数据
//   app.post("/users", async (req, res) => {
//     const { id, num } = req.body;
//     try {
//       const [result] = await pool.query(
//         "INSERT INTO test (id, num) VALUES (?, ?)",
//         [id, num]
//       );
//       res.json({ id: result.insertId });
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ error: "数据插入失败" });
//     }
//   });
// };

// ----------------------
// 中间件配置
// ----------------------

app.use(express.json({ limit: '10mb' })); // JSON请求体解析
app.use(express.urlencoded({ extended: true }));

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
//   await connectDB();
  
  app.listen(PORT, () => {
    console.log(`
      Server running in ${NODE_ENV} mode
      http://localhost:${PORT}
      ${new Date().toLocaleString()}
    `);
  });
};

startServer();