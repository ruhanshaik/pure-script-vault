import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { getMedicines, getBills } from '../services/api';
import { weeklySalesData, categorySalesData, topMedicinesData } from '../services/mockData';
import type { Medicine, Bill } from '../types';
import { SkeletonCard, SkeletonChart, SkeletonTable } from './Skeleton';
import { IconArrowUp, IconArrowDown } from './icons';

function KPICard({ title, value, change, changeType, sub }: {
  title: string; value: string; change: string; changeType: 'up' | 'down'; sub: string;
}) {
  return (
    <div className="kpi-card">
      <p className="text-xs sm:text-sm font-medium text-muted-foreground">{title}</p>
      <div className="flex items-end gap-2 sm:gap-3 mt-2">
        <span className="text-lg sm:text-2xl font-bold text-foreground">{value}</span>
        <span className={`flex items-center gap-0.5 text-xs font-medium ${changeType === 'up' ? 'text-success' : 'text-destructive'}`}>
          {changeType === 'up' ? <IconArrowUp className="h-3 w-3" /> : <IconArrowDown className="h-3 w-3" />}
          {change}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
}

export function DashboardPage({ onNavigate }: { onNavigate?: (page: string) => void }) {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMedicines(), getBills()]).then(([m, b]) => {
      setMedicines(m);
      setBills(b);
      setIsLoading(false);
    });
  }, []);

  const todayBills = bills.filter(b => new Date(b.createdAt).toDateString() === new Date().toDateString());
  const todaySales = todayBills.reduce((s, b) => s + b.grandTotal, 0);
  const pendingOrders = bills.filter(b => b.status === 'Pending').length;
  const stockAlerts = medicines.filter(m => m.quantity <= m.minStock).length;

  const nearExpiry = medicines.filter(m => {
    const diff = (new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    return diff <= 90 && diff > 0;
  }).sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime());

  const recentTxns = bills.slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5"><SkeletonChart /><SkeletonChart /><SkeletonChart /></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5"><SkeletonTable /><SkeletonTable /></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Welcome back, here is your pharmacy overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <KPICard title="Today's Sales" value={`Rs. ${todaySales.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} change="12.5%" changeType="up" sub="vs yesterday" />
        <KPICard title="Orders Pending" value={String(pendingOrders)} change="2" changeType="down" sub="from last week" />
        <KPICard title="Stock Alerts" value={String(stockAlerts)} change={stockAlerts > 0 ? String(stockAlerts) : '0'} changeType={stockAlerts > 0 ? 'up' : 'down'} sub="items low/expiring" />
        <KPICard title="Total Customers" value={String(bills.length)} change="8.3%" changeType="up" sub="this month" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-5">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Weekly Sales Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklySalesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="sales" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ fill: 'var(--color-primary)', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Category Sales</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={categorySalesData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                {categorySalesData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Top 5 Medicines</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topMedicinesData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis type="number" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
              <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="sales" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Recent Transactions</h3>
            <button onClick={() => onNavigate?.('billing')} className="text-xs font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
            <table className="w-full text-sm min-w-[400px]">
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
        </div>

        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Near Expiry Medicines</h3>
            <button onClick={() => onNavigate?.('inventory')} className="text-xs font-medium text-primary hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto -mx-4 sm:-mx-5 px-4 sm:px-5">
            <table className="w-full text-sm min-w-[400px]">
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
    </div>
  );
}
