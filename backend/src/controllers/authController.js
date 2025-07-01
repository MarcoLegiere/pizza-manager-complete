const { User } = require('../models');
const { generateToken } = require('../utils/jwt');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Buscar usuário
    const user = await User.findOne({ 
      where: { email, active: true } 
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const isPasswordValid = await user.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Gerar token
    const token = generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.role 
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout realizado com sucesso'
  });
};

module.exports = {
  login,
  me,
  logout
};

