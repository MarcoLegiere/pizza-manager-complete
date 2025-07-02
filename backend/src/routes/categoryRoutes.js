const express = require('express');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { auth, authorize } = require('../middleware/auth');

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/categories
router.get('/', getCategories);

// GET /api/categories/:id
router.get('/:id', getCategoryById);

// POST /api/categories
router.post('/', authorize('admin', 'super_admin'), createCategory);

// PUT /api/categories/:id
router.put('/:id', authorize('admin', 'super_admin'), updateCategory);

// DELETE /api/categories/:id
router.delete('/:id', authorize('admin', 'super_admin'), deleteCategory);

module.exports = router;

