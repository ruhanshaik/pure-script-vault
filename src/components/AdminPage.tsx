import { useState, useEffect } from 'react';
import { getActivityLogs } from '../services/api';
import { mockUsers } from '../services/mockData';
import type { ActivityLog } from '../types';
import { SkeletonTable } from './Skeleton';

export function AdminPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { getActivityLogs().then(l => { setLogs(l); setIsLoading(false); }); }, []);

  if (isLoading) return <SkeletonTable rows={5} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Admin & Security</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">User management, roles, and activity logs</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Users & Roles</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[400px]">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Name</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Email</th>
              <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Role</th>
              <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>{mockUsers.map(u => (
              <tr key={u.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-3 sm:px-4 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-3 sm:px-4 py-3 text-muted-foreground">{u.email}</td>
                <td className="px-3 sm:px-4 py-3 text-center"><span className={`badge ${u.role === 'Admin' ? 'badge-danger' : u.role === 'Pharmacist' ? 'badge-info' : 'badge-warning'}`}>{u.role}</span></td>
                <td className="px-3 sm:px-4 py-3 text-center"><span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Activity Logs</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">User</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Action</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Module</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Details</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Time</th>
            </tr></thead>
            <tbody>{logs.map(l => (
              <tr key={l.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-3 sm:px-4 py-3 font-medium text-foreground">{l.userName}</td>
                <td className="px-3 sm:px-4 py-3 text-muted-foreground">{l.action}</td>
                <td className="px-3 sm:px-4 py-3"><span className="badge badge-info">{l.module}</span></td>
                <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{l.details}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground">{new Date(l.timestamp).toLocaleString()}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
