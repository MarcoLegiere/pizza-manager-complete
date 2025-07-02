const express = require('express');
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { auth, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/products
router.get('/', getProducts);

// GET /api/products/:id
router.get('/:id', getProductById);

// POST /api/products
router.post('/', authorize('admin', 'super_admin'), validate(schemas.product), createProduct);

// PUT /api/products/:id
router.put('/:id', authorize('admin', 'super_admin'), validate(schemas.product), updateProduct);

// DELETE /api/products/:id
router.delete('/:id', authorize('admin', 'super_admin'), deleteProduct);

module.exports = router;

