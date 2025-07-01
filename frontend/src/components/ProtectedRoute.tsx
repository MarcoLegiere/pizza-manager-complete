
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { createContext, useContext } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'super_admin' | 'admin' | 'attendant';
}

interface TenantContextType {
  tenantId: string | null;
}

const TenantContext = createContext<TenantContextType>({ tenantId: null });

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a ProtectedRoute');
  }
  return context;
};

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Super admin tem acesso a tudo
  if (user.role === 'super_admin') {
    return (
      <TenantContext.Provider value={{ tenantId: null }}>
        {children}
      </TenantContext.Provider>
    );
  }

  // Verifica se o usuário tem o papel necessário
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verifica se o usuário está ativo
  if (!user.isActive) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Usuários admin e attendant devem ter um tenantId
  if ((user.role === 'admin' || user.role === 'attendant') && !user.tenantId) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <TenantContext.Provider value={{ tenantId: user.tenantId || null }}>
      {children}
    </TenantContext.Provider>
  );
};
