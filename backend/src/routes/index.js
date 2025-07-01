const express = require("express");
const authRoutes = require("./authRoutes");
const customerRoutes = require("./customerRoutes");
const productRoutes = require("./productRoutes");
const categoryRoutes = require("./categoryRoutes");
const orderRoutes = require("./orderRoutes");
const dashboardRoutes = require("./dashboardRoutes");
const reportRoutes = require("./reportRoutes");
const storeRoutes = require("./storeRoutes");
const { auth } = require("../middleware/auth");
const { tenantIsolation } = require("../middleware/tenantMiddleware");

const router = express.Router();

// Rotas públicas
router.use("/auth", authRoutes);

// Middleware de autenticação para todas as rotas protegidas
router.use(auth);

// Middleware de tenant para rotas que precisam de isolamento
router.use("/customers", tenantIsolation, customerRoutes);
router.use("/products", tenantIsolation, productRoutes);
router.use("/categories", tenantIsolation, categoryRoutes);
router.use("/orders", tenantIsolation, orderRoutes);
router.use("/dashboard", tenantIsolation, dashboardRoutes);
router.use("/reports", tenantIsolation, reportRoutes);

// Rotas de stores não precisam de tenant middleware (gerenciam múltiplos tenants)
router.use("/stores", storeRoutes);

module.exports = router;

