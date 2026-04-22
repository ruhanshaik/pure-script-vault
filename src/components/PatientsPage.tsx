import { useQuery } from '@tanstack/react-query';
import { getPatients } from '../services/api';
import { SkeletonTable, EmptyState } from './Skeleton';

export function PatientsPage() {
  const { data: patients = [], isLoading } = useQuery({ queryKey: ['patients'], queryFn: getPatients });
  if (isLoading) return <SkeletonTable rows={5} />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">Patients</h1>
        <p className="text-sm text-muted-foreground">{patients.length} registered patients</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Loyalty Points</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Since</th>
          </tr></thead>
          <tbody>
            {patients.length === 0 ? (
              <tr><td colSpan={5}><EmptyState message="No patients registered" /></td></tr>
            ) : patients.map(p => (
              <tr key={p.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.email || '-'}</td>
                <td className="px-4 py-3 text-right"><span className="badge badge-success">{p.loyaltyPoints} pts</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
