const express = require('express');
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrder,
  cancelOrder
} = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/orders
router.get('/', getOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

// POST /api/orders
router.post('/', validate(schemas.order), createOrder);

// PUT /api/orders/:id/status
router.put('/:id/status', updateOrder);

// PUT /api/orders/:id
router.put('/:id', updateOrder);

// DELETE /api/orders/:id
router.delete('/:id', authorize('admin', 'super_admin'), cancelOrder);

module.exports = router;

