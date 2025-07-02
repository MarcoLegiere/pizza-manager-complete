const express = require('express');
const {
  getSalesReport,
  getTopProducts,
  getDailyReport
} = require('../controllers/reportController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/reports/sales
router.get('/sales', authorize('admin', 'super_admin'), getSalesReport);

// GET /api/reports/products
router.get('/products', authorize('admin', 'super_admin'), getTopProducts);

// GET /api/reports/daily
router.get('/daily', authorize('admin', 'super_admin'), getDailyReport);

module.exports = router;

