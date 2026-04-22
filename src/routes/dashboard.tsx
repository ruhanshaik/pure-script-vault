import { createFileRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { LoginPage } from '../components/LoginPage';
import { AppLayout } from '../components/AppLayout';
import { DashboardPage } from '../components/DashboardPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000 } } });

export const Route = createFileRoute('/dashboard')({
  component: DashboardRoute,
});

function DashboardRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardGate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function DashboardGate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return <AppLayout><DashboardPage /></AppLayout>;
}
