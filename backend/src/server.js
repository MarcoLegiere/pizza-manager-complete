require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const db = require('./models');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');
const { 
  flexibleApiLimiter, 
  developmentBypass, 
  dynamicSecurityConfig,
  securityMiddleware 
} = require('./middleware/flexibleSecurity');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:8080',
    'http://localhost:3000',
    /^https:\/\/.*\.manusvm\.computer$/,
    'https://8080-ikh77cekd3biuirdfrbuj-9a32bb50.manusvm.computer',
    'https://8080-i2td0ywny4bfbcxdw280p-65fe26f5.manusvm.computer'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middlewares de segurança flexível
app.use(developmentBypass);
app.use(dynamicSecurityConfig);
app.use(flexibleApiLimiter);
app.use(securityMiddleware);

///// Routes
app.use("/api", routes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Error handling
app.use(errorHandler);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Endpoint não encontrado",
    path: req.originalUrl,
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await db.sequelize.authenticate();
    console.log('✅ Conexão com banco de dados estabelecida com sucesso.');
    
    // Sync database (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      await db.sequelize.sync({ alter: true });
      console.log('✅ Modelos sincronizados com o banco de dados.');
    }
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

