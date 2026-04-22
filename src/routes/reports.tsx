import { createFileRoute } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from '../hooks/useAuth';
import { LoginPage } from '../components/LoginPage';
import { AppLayout } from '../components/AppLayout';
import { ReportsPage } from '../components/ReportsPage';

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30000 } } });

export const Route = createFileRoute('/reports')({
  component: ReportsRoute,
});

function ReportsRoute() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Gate />
      </AuthProvider>
    </QueryClientProvider>
  );
}

function Gate() {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <LoginPage />;
  return <AppLayout><ReportsPage /></AppLayout>;
}
