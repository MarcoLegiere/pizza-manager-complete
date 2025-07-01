const express = require('express');
const { login, me, logout } = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

const router = express.Router();

// POST /api/auth/login
router.post('/login', validate(schemas.login), login);

// GET /api/auth/me
router.get('/me', auth, me);

// POST /api/auth/logout
router.post('/logout', auth, logout);

module.exports = router;

