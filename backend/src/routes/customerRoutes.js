const express = require('express');
const {
  getCustomers,
  getCustomerById,
  getCustomerByPhone,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/customers
router.get('/', getCustomers);

// GET /api/customers/phone/:phone (deve vir antes de /:id)
router.get('/phone/:phone', getCustomerByPhone);

// GET /api/customers/:id
router.get('/:id', getCustomerById);

// POST /api/customers
router.post('/', validate(schemas.customer), createCustomer);

// PUT /api/customers/:id
router.put('/:id', validate(schemas.customer), updateCustomer);

// DELETE /api/customers/:id
router.delete('/:id', authorize('admin', 'super_admin'), deleteCustomer);

module.exports = router;

