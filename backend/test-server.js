require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares básicos
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Rota de teste
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Backend Pizza Manager funcionando!'
  });
});

// Rota de teste para login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@pizza.com' && password === 'admin123') {
    res.json({
      success: true,
      data: {
        token: 'fake-jwt-token-for-testing',
        user: {
          id: '1',
          name: 'Super Admin',
          email: 'admin@pizza.com',
          role: 'super_admin'
        }
      }
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Credenciais inválidas'
    });
  }
});

// Rota de teste para dashboard
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      ordersToday: 2,
      revenueToday: 93.70,
      activeOrders: 2,
      averageTicket: 46.85
    }
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor de teste rodando na porta ${PORT}`);
  console.log(`🌍 Health check: http://localhost:${PORT}/health`);
});

