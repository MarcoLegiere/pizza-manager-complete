const { sequelize } = require('../models');

// Middleware de auditoria para operações CRUD
const auditMiddleware = (action) => {
  return (req, res, next) => {
    // Adicionar informações de auditoria ao request
    req.auditInfo = {
      action,
      userId: req.user?.userId,
      tenantId: req.tenantId,
      timestamp: new Date(),
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    };
    
    next();
  };
};

// Função para registrar log de auditoria
const logAudit = async (auditInfo, resourceType, resourceId, oldData = null, newData = null) => {
  try {
    await sequelize.query(`
      INSERT INTO audit_logs (
        id, tenant_id, user_id, action, resource_type, resource_id,
        old_data, new_data, ip_address, user_agent, created_at
      ) VALUES (
        gen_random_uuid(), :tenantId, :userId, :action, :resourceType, :resourceId,
        :oldData, :newData, :ipAddress, :userAgent, :timestamp
      )
    `, {
      replacements: {
        tenantId: auditInfo.tenantId,
        userId: auditInfo.userId,
        action: auditInfo.action,
        resourceType,
        resourceId,
        oldData: oldData ? JSON.stringify(oldData) : null,
        newData: newData ? JSON.stringify(newData) : null,
        ipAddress: auditInfo.ip,
        userAgent: auditInfo.userAgent,
        timestamp: auditInfo.timestamp
      }
    });
  } catch (error) {
    console.error('Erro ao registrar auditoria:', error);
    // Não falhar a operação principal por erro de auditoria
  }
};

// Middleware para capturar dados antes da modificação
const captureBeforeData = (model, idField = 'id') => {
  return async (req, res, next) => {
    try {
      const id = req.params[idField];
      if (id && (req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE')) {
        const [results] = await sequelize.query(`
          SELECT * FROM ${model.toLowerCase()}s WHERE id = :id AND tenant_id = :tenantId
        `, {
          replacements: { id, tenantId: req.tenantId }
        });
        
        req.beforeData = results[0] || null;
      }
      next();
    } catch (error) {
      console.error('Erro ao capturar dados anteriores:', error);
      next();
    }
  };
};

// Função para criar migration da tabela de auditoria
const createAuditTable = async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id UUID,
        user_id UUID,
        action VARCHAR(50) NOT NULL,
        resource_type VARCHAR(50) NOT NULL,
        resource_id UUID,
        old_data JSONB,
        new_data JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        INDEX idx_audit_tenant_id (tenant_id),
        INDEX idx_audit_user_id (user_id),
        INDEX idx_audit_resource (resource_type, resource_id),
        INDEX idx_audit_created_at (created_at)
      )
    `);
    console.log('✅ Tabela de auditoria criada/verificada');
  } catch (error) {
    console.error('❌ Erro ao criar tabela de auditoria:', error);
  }
};

// Função para buscar logs de auditoria
const getAuditLogs = async (filters = {}) => {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const replacements = {};
    
    if (filters.tenantId) {
      query += ' AND tenant_id = :tenantId';
      replacements.tenantId = filters.tenantId;
    }
    
    if (filters.userId) {
      query += ' AND user_id = :userId';
      replacements.userId = filters.userId;
    }
    
    if (filters.resourceType) {
      query += ' AND resource_type = :resourceType';
      replacements.resourceType = filters.resourceType;
    }
    
    if (filters.resourceId) {
      query += ' AND resource_id = :resourceId';
      replacements.resourceId = filters.resourceId;
    }
    
    if (filters.action) {
      query += ' AND action = :action';
      replacements.action = filters.action;
    }
    
    if (filters.startDate) {
      query += ' AND created_at >= :startDate';
      replacements.startDate = filters.startDate;
    }
    
    if (filters.endDate) {
      query += ' AND created_at <= :endDate';
      replacements.endDate = filters.endDate;
    }
    
    query += ' ORDER BY created_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT :limit';
      replacements.limit = filters.limit;
    }
    
    const [results] = await sequelize.query(query, { replacements });
    return results;
  } catch (error) {
    console.error('Erro ao buscar logs de auditoria:', error);
    return [];
  }
};

// Estatísticas de auditoria
const getAuditStats = async (tenantId, startDate, endDate) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        action,
        resource_type,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM audit_logs 
      WHERE tenant_id = :tenantId 
        AND created_at BETWEEN :startDate AND :endDate
      GROUP BY action, resource_type
      ORDER BY count DESC
    `, {
      replacements: { tenantId, startDate, endDate }
    });
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar estatísticas de auditoria:', error);
    return [];
  }
};

module.exports = {
  auditMiddleware,
  logAudit,
  captureBeforeData,
  createAuditTable,
  getAuditLogs,
  getAuditStats
};

