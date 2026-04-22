import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Link } from '@tanstack/react-router';
import { getMedicines, getBills } from '../services/api';
import { weeklySalesData, categorySalesData, topMedicinesData } from '../services/mockData';
import { SkeletonCard, SkeletonChart, SkeletonTable } from './Skeleton';
import { IconArrowUp, IconArrowDown } from './icons';

function KPICard({ title, value, change, changeType, sub }: {
  title: string; value: string; change: string; changeType: 'up' | 'down'; sub: string;
}) {
  return (
    <div className="kpi-card">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex items-end gap-3 mt-2">
        <span className="text-2xl font-bold text-foreground">{value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${changeType === 'up' ? 'text-success' : 'text-destructive'}`}>
          {changeType === 'up' ? <IconArrowUp className="h-3 w-3" /> : <IconArrowDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export function DashboardPage() {
  const { data: medicines, isLoading: medsLoading } = useQuery({ queryKey: ['medicines'], queryFn: getMedicines });
  const { data: bills, isLoading: billsLoading } = useQuery({ queryKey: ['bills'], queryFn: getBills });

  const isLoading = medsLoading || billsLoading;

  const todayBills = bills?.filter(b => {
    const d = new Date(b.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }) ?? [];

  const todaySales = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const pendingOrders = bills?.filter(b => b.status === 'Pending').length ?? 0;
  const stockAlerts = medicines?.filter(m => m.quantity <= m.minStock).length ?? 0;

  const nearExpiry = medicines?.filter(m => {
    const exp = new Date(m.expiryDate);
    const diff = (exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()) ?? [];

  const recentTxns = bills?.slice(0, 5) ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-5">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div className="grid grid-cols-3 gap-5"><SkeletonChart /><SkeletonChart /><SkeletonChart /></div>
        <div className="grid grid-cols-2 gap-5"><SkeletonTable /><SkeletonTable /></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, here is your pharmacy overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-5">
        <KPICard title="Today's Sales" value={`Rs. ${todaySales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} change="12.5%" changeType="up" sub="vs yesterday" />
        <KPICard title="Orders Pending" value={String(pendingOrders)} change="2" changeType="down" sub="from last week" />
        <KPICard title="Stock Alerts" value={String(stockAlerts)} change={stockAlerts > 0 ? String(stockAlerts) : '0'} changeType={stockAlerts > 0 ? 'up' : 'down'} sub="items low/expiring" />
        <KPICard title="Total Customers" value={String(bills?.length ?? 0)} change="8.3%" changeType="up" sub="this month" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-5">
        {/* Weekly Sales */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={weeklySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Sales</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categorySalesData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value" label={(props: any) => `${props.name ?? ''} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                {categorySalesData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Medicines Bar */}
        <div className="col-span-1 rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Medicines</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topMedicinesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }} />
              <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables */}
      <div className="grid grid-cols-2 gap-5">
        {/* Recent Transactions */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
            <Link to="/billing" className="text-xs font-medium text-primary hover:underline">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Bill No</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Patient</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Amount</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTxns.map(b => (
                <tr key={b.id} className="border-b border-border last:border-0 table-row-hover">
                  <td className="py-2.5 font-medium text-foreground">{b.billNumber}</td>
                  <td className="py-2.5 text-muted-foreground">{b.patientName}</td>
                  <td className="py-2.5 text-right font-medium text-foreground">Rs. {b.grandTotal.toFixed(2)}</td>
                  <td className="py-2.5 text-right">
                    <span className={`badge ${b.status === 'Completed' ? 'badge-success' : b.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Near Expiry */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Near Expiry Medicines</h3>
            <Link to="/inventory" className="text-xs font-medium text-primary hover:underline">View All</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Medicine</th>
                <th className="pb-2 text-left text-xs font-medium text-muted-foreground">Batch</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Expiry</th>
                <th className="pb-2 text-right text-xs font-medium text-muted-foreground">Days Left</th>
              </tr>
            </thead>
            <tbody>
              {nearExpiry.slice(0, 5).map(m => {
                const daysLeft = Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="py-2.5 font-medium text-foreground">{m.name}</td>
                    <td className="py-2.5 text-muted-foreground">{m.batchNumber}</td>
                    <td className="py-2.5 text-right text-muted-foreground">{new Date(m.expiryDate).toLocaleDateString()}</td>
                    <td className="py-2.5 text-right">
                      <span className={`badge ${daysLeft <= 30 ? 'badge-danger' : daysLeft <= 60 ? 'badge-warning' : 'badge-info'}`}>
                        {daysLeft} days
                      </span>
                    </td>
                  </tr>
                );
              })}
              {nearExpiry.length === 0 && (
                <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">No medicines near expiry</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
