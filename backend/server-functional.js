require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const { sequelize } = require('./src/models');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Pizza Manager Backend funcionando!',
    timestamp: new Date().toISOString(),
    version: '2.0.0-multi-tenant'
  });
});

// Rotas básicas de autenticação
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuário no banco
    const [users] = await sequelize.query(
      'SELECT * FROM users WHERE email = :email AND active = true AND deleted_at IS NULL',
      { replacements: { email } }
    );
    
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    const user = users[0];
    
    // Verificar senha (simplificado para teste)
    const bcrypt = require('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }
    
    // Buscar dados do tenant se existir
    let tenant = null;
    if (user.tenant_id) {
      const [tenants] = await sequelize.query(
        'SELECT * FROM stores WHERE id = :tenant_id',
        { replacements: { tenant_id: user.tenant_id } }
      );
      tenant = tenants[0] || null;
    }
    
    // Gerar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        tenantId: user.tenant_id 
      },
      process.env.JWT_SECRET || 'secret_key_temp',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenant_id: user.tenant_id
        },
        tenant
      }
    });
    
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Middleware de autenticação simples
const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso requerido'
    });
  }
  
  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key_temp');
    req.user = decoded;
    req.tenantId = decoded.tenantId;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Rota do dashboard
app.get('/api/dashboard/stats', authMiddleware, async (req, res) => {
  try {
    const tenantId = req.tenantId;
    
    if (!tenantId) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado - tenant requerido'
      });
    }
    
    // Buscar estatísticas do tenant
    const [orders] = await sequelize.query(
      'SELECT COUNT(*) as total_orders, SUM(total) as total_revenue FROM orders WHERE tenant_id = :tenantId AND deleted_at IS NULL',
      { replacements: { tenantId } }
    );
    
    const [customers] = await sequelize.query(
      'SELECT COUNT(*) as total_customers FROM customers WHERE tenant_id = :tenantId AND deleted_at IS NULL',
      { replacements: { tenantId } }
    );
    
    const [products] = await sequelize.query(
      'SELECT COUNT(*) as total_products FROM products WHERE tenant_id = :tenantId AND deleted_at IS NULL',
      { replacements: { tenantId } }
    );
    
    res.json({
      success: true,
      data: {
        totalOrders: parseInt(orders[0].total_orders) || 0,
        totalRevenue: parseFloat(orders[0].total_revenue) || 0,
        totalCustomers: parseInt(customers[0].total_customers) || 0,
        totalProducts: parseInt(products[0].total_products) || 0
      }
    });
    
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Rota de stores
app.get('/api/stores', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;
    
    let query = 'SELECT * FROM stores WHERE active = true';
    let replacements = {};
    
    // Se não for super_admin, mostrar apenas o tenant do usuário
    if (userRole !== 'super_admin' && req.tenantId) {
      query += ' AND id = :tenantId';
      replacements.tenantId = req.tenantId;
    }
    
    const [stores] = await sequelize.query(query, { replacements });
    
    res.json({
      success: true,
      data: stores
    });
    
  } catch (error) {
    console.error('Erro ao buscar estabelecimentos:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco
    await sequelize.authenticate();
    console.log('✅ Conexão com banco estabelecida');
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}/health`);
      console.log(`🔐 Multi-tenant ativado`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

startServer();

