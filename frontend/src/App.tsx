
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import OrderProvider from '@/contexts/OrderContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';

// Pages
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Orders from '@/pages/Orders';
import NewOrder from '@/pages/NewOrder';
import Customers from '@/pages/Customers';
import Reports from '@/pages/Reports';
import SuperAdmin from '@/pages/SuperAdmin';
import StoreSettings from '@/pages/StoreSettings';
import NotFound from '@/pages/NotFound';
import Unauthorized from '@/pages/Unauthorized';

import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrderProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                
                <Route path="/" element={<Index />} />
                
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                <Route path="/new-order" element={
                  <ProtectedRoute>
                    <NewOrder />
                  </ProtectedRoute>
                } />
                
                <Route path="/customers" element={
                  <ProtectedRoute>
                    <Customers />
                  </ProtectedRoute>
                } />
                
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                } />

                <Route path="/store-settings" element={
                  <ProtectedRoute requiredRole="admin">
                    <StoreSettings />
                  </ProtectedRoute>
                } />
                
                <Route path="/super-admin" element={
                  <ProtectedRoute requiredRole="super_admin">
                    <SuperAdmin />
                  </ProtectedRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
            <Toaster />
          </Router>
        </OrderProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
