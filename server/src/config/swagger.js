const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'IncanGold Backend API',
      version: '1.0.0',
      description: 'Blockchain game Incan Gold.'
    },
    servers: [
      { url: 'http://localhost:5000', description: '本地开发环境' }
    ],
    // 定义安全方案
    components: {
      securitySchemes: {
          bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT' // 指定令牌格式为 JWT
          }
      }
    },
  },
  apis: ['./src/routes/*.js'] // 路由文件路径
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;