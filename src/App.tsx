import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SalespersonDashboard } from './pages/sales/SalespersonDashboard';
import { SalesList } from './pages/sales/SalesList';
import { SaleForm } from './pages/sales/SaleForm';
import { SaleDetails } from './pages/sales/SaleDetails';
import { DailyStatement } from './pages/sales/DailyStatement';
import { CustomerFeedbackPage } from './pages/feedback/CustomerFeedbackPage';
import { ExcelImport } from './pages/excel/ExcelImport';
import { ExcelExport } from './pages/excel/ExcelExport';
import { ExcelSheets } from './pages/admin/ExcelSheets';
import { ReportsAnalytics } from './pages/admin/ReportsAnalytics';
import { UserManagement } from './pages/admin/UserManagement';
import { AuditLogs } from './pages/admin/AuditLogs';
import { Profile } from './pages/Profile';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; requiredRole?: 'ADMIN' | 'SALESPERSON' }> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#EEF2F8]"><LoadingSpinner size="lg" /></div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') {
    return <AdminDashboard />;
  }
  return <SalespersonDashboard />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: '#FFFFFF',
              color: '#172554',
              borderRadius: '0.75rem',
              border: '1px solid #D5DFED',
              fontWeight: 600,
              fontSize: '0.8125rem',
              boxShadow: '0 10px 25px -5px rgba(23, 37, 84, 0.1)',
            },
          }}
        />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardRouter />} />
            <Route path="/sales" element={<SalesList />} />
            <Route path="/sales/new" element={<SaleForm />} />
            <Route path="/sales/:id" element={<SaleDetails />} />
            <Route path="/sales/:id/edit" element={<SaleForm />} />
            <Route path="/daily-statement" element={<DailyStatement />} />
            <Route path="/feedback" element={<CustomerFeedbackPage />} />
            <Route path="/excel/import" element={<ExcelImport />} />
            <Route path="/excel/export" element={<ExcelExport />} />
            <Route path="/profile" element={<Profile />} />

            {/* Admin only routes */}
            <Route
              path="/admin/excel-sheets"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ExcelSheets />
                </ProtectedRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <ReportsAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AuditLogs />
                </ProtectedRoute>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
