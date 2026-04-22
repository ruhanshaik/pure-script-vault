import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { LoginPage } from '../components/LoginPage';
import { AppLayout, type PageKey } from '../components/AppLayout';
import { DashboardPage } from '../components/DashboardPage';
import { InventoryPage } from '../components/InventoryPage';
import { BillingPage } from '../components/BillingPage';
import { PatientsPage } from '../components/PatientsPage';
import { SuppliersPage } from '../components/SuppliersPage';
import { AccountingPage } from '../components/AccountingPage';
import { ReportsPage } from '../components/ReportsPage';
import { AdminPage } from '../components/AdminPage';

export const Route = createFileRoute('/')({
  component: RootIndex,
});

function RootIndex() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}

function AuthGate() {
  const { isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<PageKey>('dashboard');

  if (!isAuthenticated) return <LoginPage />;

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage onNavigate={setCurrentPage as (p: string) => void} />;
      case 'inventory': return <InventoryPage />;
      case 'billing': return <BillingPage />;
      case 'patients': return <PatientsPage />;
      case 'suppliers': return <SuppliersPage />;
      case 'accounting': return <AccountingPage />;
      case 'reports': return <ReportsPage />;
      case 'admin': return <AdminPage />;
      default: return <DashboardPage onNavigate={setCurrentPage as (p: string) => void} />;
    }
  };

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </AppLayout>
  );
}
