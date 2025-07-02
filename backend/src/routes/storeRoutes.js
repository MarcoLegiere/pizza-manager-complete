const express = require("express");
const {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  deleteStore,
} = require("../controllers/storeController");
const { auth, authorize } = require("../middleware/auth");

const router = express.Router();

// Aplicar autenticação em todas as rotas
router.use(auth);

// GET /api/stores
router.get("/", getStores);

// GET /api/stores/:id
router.get("/:id", getStoreById);

// POST /api/stores
router.post("/", authorize("admin", "super_admin"), createStore);

// PUT /api/stores/:id
router.put("/:id", authorize("admin", "super_admin"), updateStore);

// DELETE /api/stores/:id
router.delete("/:id", authorize("admin", "super_admin"), deleteStore);

module.exports = router;

