const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Configurações flexíveis baseadas no tipo de usuário/plano
const SECURITY_CONFIGS = {
  // Configuração para desenvolvimento/teste (mais permissiva)
  development: {
    loginAttempts: 20,
    apiRequests: 1000,
    heavyOperations: 50,
    tenantRequests: 500,
    windowMs: 15 * 60 * 1000 // 15 minutos
  },
  
  // Configuração para usuários premium (mais flexível)
  premium: {
    loginAttempts: 15,
    apiRequests: 500,
    heavyOperations: 30,
    tenantRequests: 300,
    windowMs: 15 * 60 * 1000
  },
  
  // Configuração padrão (balanceada)
  standard: {
    loginAttempts: 10,
    apiRequests: 200,
    heavyOperations: 20,
    tenantRequests: 150,
    windowMs: 15 * 60 * 1000
  },
  
  // Configuração restritiva (para segurança máxima)
  strict: {
    loginAttempts: 5,
    apiRequests: 100,
    heavyOperations: 10,
    tenantRequests: 50,
    windowMs: 15 * 60 * 1000
  }
};

// Função para obter configuração baseada no ambiente ou usuário
const getSecurityConfig = (req) => {
  // Verificar se é ambiente de desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    return SECURITY_CONFIGS.development;
  }
  
  // Verificar se o usuário tem plano premium (baseado no token JWT)
  if (req.user && req.user.plan === 'premium') {
    return SECURITY_CONFIGS.premium;
  }
  
  // Verificar se é super admin (sem limitações)
  if (req.user && req.user.role === 'super_admin') {
    return SECURITY_CONFIGS.development; // Sem limitações para super admin
  }
  
  // Configuração padrão
  return SECURITY_CONFIGS.standard;
};

// Rate limiting flexível para login
const createFlexibleLoginLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
      const config = getSecurityConfig(req);
      return config.loginAttempts;
    },
    message: (req) => {
      const config = getSecurityConfig(req);
      return {
        success: false,
        message: `Muitas tentativas de login. Tente novamente em 15 minutos. (Limite: ${config.loginAttempts} tentativas)`,
        retryAfter: 15 * 60
      };
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `${req.ip}-${req.body.email || 'unknown'}`;
    },
    // Pular limitação para super admins
    skip: (req) => {
      return req.user && req.user.role === 'super_admin';
    }
  });
};

// Rate limiting flexível para API geral
const createFlexibleApiLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
      const config = getSecurityConfig(req);
      return config.apiRequests;
    },
    message: (req) => {
      const config = getSecurityConfig(req);
      return {
        success: false,
        message: `Limite de requisições excedido. Tente novamente em alguns minutos. (Limite: ${config.apiRequests} req/15min)`,
      };
    },
    standardHeaders: true,
    legacyHeaders: false,
    // Pular limitação para super admins
    skip: (req) => {
      return req.user && req.user.role === 'super_admin';
    }
  });
};

// Slow down flexível para operações pesadas
const createFlexibleSlowDown = () => {
  return slowDown({
    windowMs: 15 * 60 * 1000,
    delayAfter: (req) => {
      const config = getSecurityConfig(req);
      return Math.floor(config.heavyOperations / 4); // 25% do limite
    },
    delayMs: 200, // Delay menor
    maxDelayMs: 5000, // Máximo 5 segundos (reduzido)
    // Pular para super admins
    skip: (req) => {
      return req.user && req.user.role === 'super_admin';
    }
  });
};

// Rate limiting específico por tenant (flexível)
const createFlexibleTenantLimiter = () => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: (req) => {
      const config = getSecurityConfig(req);
      return config.tenantRequests;
    },
    keyGenerator: (req) => {
      return `tenant-${req.tenantId || req.ip}`;
    },
    message: (req) => {
      const config = getSecurityConfig(req);
      return {
        success: false,
        message: `Limite de requisições do estabelecimento excedido. (Limite: ${config.tenantRequests} req/15min)`,
      };
    },
    // Pular para super admins
    skip: (req) => {
      return req.user && req.user.role === 'super_admin';
    }
  });
};

// Middleware de bypass para desenvolvimento
const developmentBypass = (req, res, next) => {
  if (process.env.NODE_ENV === 'development' && process.env.DISABLE_RATE_LIMIT === 'true') {
    console.log('🚀 Rate limiting desabilitado para desenvolvimento');
    return next();
  }
  next();
};

// Middleware de configuração de segurança dinâmica
const dynamicSecurityConfig = (req, res, next) => {
  const config = getSecurityConfig(req);
  req.securityConfig = config;
  
  // Log da configuração aplicada (apenas em desenvolvimento)
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔒 Configuração de segurança aplicada:`, {
      user: req.user?.email || 'anônimo',
      role: req.user?.role || 'guest',
      config: config
    });
  }
  
  next();
};

// Middleware de validação de entrada (mantido do arquivo original)
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, '');
      };
      
      const sanitizeObject = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
          return typeof obj === 'string' ? sanitizeString(obj) : obj;
        }
        
        const sanitized = {};
        for (const [key, value] of Object.entries(obj)) {
          if (Array.isArray(value)) {
            sanitized[key] = value.map(sanitizeObject);
          } else if (typeof value === 'object') {
            sanitized[key] = sanitizeObject(value);
          } else {
            sanitized[key] = sanitizeString(value);
          }
        }
        return sanitized;
      };
      
      req.body = sanitizeObject(req.body);
      
      if (schema) {
        const { error, value } = schema.validate(req.body);
        if (error) {
          return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => ({
              field: detail.path.join('.'),
              message: detail.message
            }))
          });
        }
        req.body = value;
      }
      
      next();
    } catch (error) {
      console.error('Erro na validação de entrada:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware de detecção de ataques (simplificado)
const securityMiddleware = (req, res, next) => {
  try {
    // Pular verificação para super admins
    if (req.user && req.user.role === 'super_admin') {
      return next();
    }
    
    const suspiciousPatterns = [
      /(\<script\>|\<\/script\>)/gi,
      /(union|select|insert|delete|drop|create|alter)/gi,
      /(\.\.\/)|(\.\.\\)/g,
      /(eval\(|setTimeout\(|setInterval\()/gi,
    ];
    
    const checkString = (str) => {
      if (typeof str !== 'string') return false;
      return suspiciousPatterns.some(pattern => pattern.test(str));
    };
    
    const checkObject = (obj) => {
      if (typeof obj !== 'object' || obj === null) {
        return checkString(obj);
      }
      
      for (const value of Object.values(obj)) {
        if (Array.isArray(value)) {
          if (value.some(checkObject)) return true;
        } else if (typeof value === 'object') {
          if (checkObject(value)) return true;
        } else if (checkString(value)) {
          return true;
        }
      }
      return false;
    };
    
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
      console.warn('Tentativa de ataque detectada:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl
      });
      
      return res.status(400).json({
        success: false,
        message: 'Requisição inválida detectada'
      });
    }
    
    next();
  } catch (error) {
    console.error('Erro no middleware de segurança:', error);
    next();
  }
};

module.exports = {
  // Limiters flexíveis
  flexibleLoginLimiter: createFlexibleLoginLimiter(),
  flexibleApiLimiter: createFlexibleApiLimiter(),
  flexibleSlowDown: createFlexibleSlowDown(),
  flexibleTenantLimiter: createFlexibleTenantLimiter(),
  
  // Middlewares
  developmentBypass,
  dynamicSecurityConfig,
  validateInput,
  securityMiddleware,
  
  // Configurações
  SECURITY_CONFIGS,
  getSecurityConfig
};

