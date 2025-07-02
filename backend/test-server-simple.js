require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors());
app.use(express.json());

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota de teste do banco
app.get('/test-db', async (req, res) => {
  try {
    await sequelize.authenticate();
    const stores = await sequelize.query('SELECT * FROM stores LIMIT 2');
    res.json({ 
      success: true, 
      message: 'Banco conectado!',
      stores: stores[0]
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Erro no banco',
      error: error.message
    });
  }
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
});

