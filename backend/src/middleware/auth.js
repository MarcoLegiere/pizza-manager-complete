const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado'
      });
    }
    next();
  };
};

module.exports = { auth, authorize };

