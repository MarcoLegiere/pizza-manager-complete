const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiting para login (mais restritivo)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 tentativas por IP
  message: {
    success: false,
    message: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Aplicar por IP + email para ser mais específico
  keyGenerator: (req) => {
    return `${req.ip}-${req.body.email || 'unknown'}`;
  }
});

// Rate limiting geral para API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Slow down para operações pesadas
const heavyOperationSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutos
  delayAfter: 5, // permitir 5 requests rápidas
  delayMs: 500, // adicionar 500ms de delay após o limite
  maxDelayMs: 20000, // máximo 20 segundos de delay
});

// Rate limiting específico por tenant
const createTenantLimiter = (maxRequests = 50) => {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    max: maxRequests,
    keyGenerator: (req) => {
      return `tenant-${req.tenantId || req.ip}`;
    },
    message: {
      success: false,
      message: 'Limite de requisições do estabelecimento excedido.',
    }
  });
};

// Middleware de validação de entrada avançada
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      // Sanitizar strings
      const sanitizeString = (str) => {
        if (typeof str !== 'string') return str;
        return str.trim().replace(/[<>]/g, '');
      };
      
      // Função recursiva para sanitizar objeto
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
      
      // Sanitizar body
      req.body = sanitizeObject(req.body);
      
      // Validar com schema se fornecido
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

// Middleware de detecção de ataques
const securityMiddleware = (req, res, next) => {
  try {
    const suspiciousPatterns = [
      /(\<script\>|\<\/script\>)/gi, // XSS básico
      /(union|select|insert|delete|drop|create|alter)/gi, // SQL Injection
      /(\.\.\/)|(\.\.\\)/g, // Path Traversal
      /(eval\(|setTimeout\(|setInterval\()/gi, // Code Injection
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
    
    // Verificar body, query e params
    if (checkObject(req.body) || checkObject(req.query) || checkObject(req.params)) {
      console.warn('Tentativa de ataque detectada:', {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        url: req.originalUrl,
        body: req.body,
        query: req.query,
        params: req.params
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

// Middleware de log de segurança
const securityLogger = (req, res, next) => {
  // Log de requisições suspeitas
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip'
  ];
  
  const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
    req.headers[header] && req.headers[header] !== req.ip
  );
  
  if (hasSuspiciousHeaders) {
    console.warn('Headers suspeitos detectados:', {
      ip: req.ip,
      headers: req.headers,
      url: req.originalUrl
    });
  }
  
  // Log de User-Agents suspeitos
  const userAgent = req.get('User-Agent') || '';
  const suspiciousUserAgents = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'nessus'
  ];
  
  if (suspiciousUserAgents.some(agent => 
    userAgent.toLowerCase().includes(agent)
  )) {
    console.warn('User-Agent suspeito detectado:', {
      ip: req.ip,
      userAgent,
      url: req.originalUrl
    });
  }
  
  next();
};

module.exports = {
  loginLimiter,
  apiLimiter,
  heavyOperationSlowDown,
  createTenantLimiter,
  validateInput,
  securityMiddleware,
  securityLogger
};

