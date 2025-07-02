const { User, Store } = require('../models');

/**
 * Middleware para garantir isolamento de dados por tenant
 * Adiciona o tenant_id do usuário ao req.tenant
 */
const tenantIsolation = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Super admin pode acessar qualquer tenant
    if (req.user.role === 'super_admin') {
      // Se especificado um tenant_id na query ou body, usar esse
      const requestedTenantId = req.query.tenant_id || req.body.tenant_id;
      
      if (requestedTenantId) {
        // Verificar se o tenant existe
        const tenant = await Store.findByPk(requestedTenantId);
        if (!tenant) {
          return res.status(404).json({
            success: false,
            error: 'Estabelecimento não encontrado'
          });
        }
        req.tenant = tenant;
      } else {
        // Super admin sem tenant específico - permitir acesso global
        req.tenant = null;
      }
    } else {
      // Usuários normais só podem acessar seu próprio tenant
      if (!req.user.tenant_id) {
        return res.status(403).json({
          success: false,
          error: 'Usuário não possui estabelecimento associado'
        });
      }

      const tenant = await Store.findByPk(req.user.tenant_id);
      if (!tenant || !tenant.active) {
        return res.status(403).json({
          success: false,
          error: 'Estabelecimento inativo ou não encontrado'
        });
      }

      req.tenant = tenant;
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

/**
 * Middleware para adicionar filtros de tenant nas queries
 * Automaticamente adiciona WHERE tenant_id = ? nas queries
 */
const addTenantFilter = (req, res, next) => {
  // Adicionar tenant_id aos filtros se não for super admin
  if (req.tenant && req.tenant.id) {
    req.tenantId = req.tenant.id;
    
    // Adicionar tenant_id ao body para operações de criação/atualização
    if (req.method === 'POST' || req.method === 'PUT') {
      req.body.tenant_id = req.tenant.id;
    }
  }

  next();
};

/**
 * Middleware para validar acesso a recursos específicos
 * Verifica se o recurso pertence ao tenant do usuário
 */
const validateTenantAccess = (model, idParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[idParam];
      
      if (!resourceId) {
        return res.status(400).json({
          success: false,
          error: 'ID do recurso não fornecido'
        });
      }

      // Super admin pode acessar qualquer recurso
      if (req.user.role === 'super_admin' && !req.tenant) {
        return next();
      }

      const resource = await model.findByPk(resourceId);
      
      if (!resource) {
        return res.status(404).json({
          success: false,
          error: 'Recurso não encontrado'
        });
      }

      // Verificar se o recurso pertence ao tenant do usuário
      if (resource.tenant_id && resource.tenant_id !== req.tenant.id) {
        return res.status(403).json({
          success: false,
          error: 'Acesso negado a este recurso'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      console.error('Erro na validação de acesso ao tenant:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };
};

/**
 * Helper para criar queries com filtro de tenant
 */
const getTenantFilter = (req) => {
  if (req.user.role === 'super_admin' && !req.tenant) {
    return {}; // Super admin sem tenant específico - sem filtro
  }
  
  return req.tenant ? { tenant_id: req.tenant.id } : {};
};

/**
 * Helper para validar se o usuário pode acessar um tenant específico
 */
const canAccessTenant = (user, tenantId) => {
  // Super admin pode acessar qualquer tenant
  if (user.role === 'super_admin') {
    return true;
  }
  
  // Outros usuários só podem acessar seu próprio tenant
  return user.tenant_id === tenantId;
};

module.exports = {
  tenantIsolation,
  addTenantFilter,
  validateTenantAccess,
  getTenantFilter,
  canAccessTenant
};

