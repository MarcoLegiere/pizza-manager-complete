const express = require('express');
const {
  getDashboardStats,
  getRecentOrders
} = require('../controllers/dashboardController');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/dashboard/stats
router.get('/stats', getDashboardStats);

// GET /api/dashboard/recent-orders
router.get('/recent-orders', getRecentOrders);

module.exports = router;

