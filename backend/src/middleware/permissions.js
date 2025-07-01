// Sistema de Permissões Avançado
const permissions = {
  // Permissões de Super Admin
  super_admin: [
    'manage_all_tenants',
    'create_tenant',
    'delete_tenant',
    'manage_all_users',
    'view_system_reports',
    'manage_system_settings'
  ],
  
  // Permissões de Admin (por tenant)
  admin: [
    'manage_tenant_users',
    'manage_orders',
    'manage_products',
    'manage_categories',
    'manage_customers',
    'view_reports',
    'manage_store_settings',
    'export_data'
  ],
  
  // Permissões de Manager
  manager: [
    'view_orders',
    'update_order_status',
    'view_products',
    'view_customers',
    'create_order',
    'view_basic_reports'
  ],
  
  // Permissões de Funcionário
  employee: [
    'view_orders',
    'update_order_status',
    'view_products',
    'create_order'
  ]
};

// Middleware de verificação de permissões
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }
      
      const userPermissions = permissions[userRole] || [];
      
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para esta operação'
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro na verificação de permissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware de verificação de múltiplas permissões (OR)
const checkAnyPermission = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }
      
      const userPermissions = permissions[userRole] || [];
      
      const hasPermission = requiredPermissions.some(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permissão insuficiente para esta operação'
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro na verificação de permissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Middleware de verificação de múltiplas permissões (AND)
const checkAllPermissions = (requiredPermissions) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      
      if (!userRole) {
        return res.status(401).json({
          success: false,
          message: 'Usuário não autenticado'
        });
      }
      
      const userPermissions = permissions[userRole] || [];
      
      const hasAllPermissions = requiredPermissions.every(permission => 
        userPermissions.includes(permission)
      );
      
      if (!hasAllPermissions) {
        return res.status(403).json({
          success: false,
          message: 'Permissões insuficientes para esta operação'
        });
      }
      
      next();
    } catch (error) {
      console.error('Erro na verificação de permissões:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  };
};

// Função para verificar se usuário tem permissão específica
const hasPermission = (userRole, permission) => {
  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes(permission);
};

// Função para obter todas as permissões de um role
const getRolePermissions = (role) => {
  return permissions[role] || [];
};

module.exports = {
  permissions,
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  hasPermission,
  getRolePermissions
};

