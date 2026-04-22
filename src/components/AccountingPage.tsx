import { useState, useEffect } from 'react';
import { getBills, getExpenses } from '../services/api';
import type { Bill, Expense } from '../types';
import { SkeletonCard } from './Skeleton';

export function AccountingPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBills(), getExpenses()]).then(([b, e]) => {
      setBills(b); setExpenses(e); setIsLoading(false);
    });
  }, []);

  const totalRevenue = bills.filter(b => b.status === 'Completed').reduce((s, b) => s + b.grandTotal, 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const totalGST = bills.reduce((s, b) => s + b.cgst + b.sgst, 0);
  const receivables = bills.filter(b => b.status === 'Pending').reduce((s, b) => s + b.grandTotal, 0);
  const profit = totalRevenue - totalExpenses;

  if (isLoading) return <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Financial Accounting</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">Overview of revenue, expenses, and taxes</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {[
          { label: 'Total Revenue', value: totalRevenue, color: 'text-success' },
          { label: 'Total Expenses', value: totalExpenses, color: 'text-destructive' },
          { label: 'Net Profit', value: profit, color: profit >= 0 ? 'text-success' : 'text-destructive' },
          { label: 'Receivables', value: receivables, color: 'text-warning' },
        ].map(item => (
          <div key={item.label} className="kpi-card">
            <p className="text-xs sm:text-sm text-muted-foreground">{item.label}</p>
            <p className={`text-lg sm:text-2xl font-bold mt-2 ${item.color}`}>Rs. {item.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-5">
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">GST Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total CGST Collected</span><span className="font-medium">Rs. {(totalGST / 2).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total SGST Collected</span><span className="font-medium">Rs. {(totalGST / 2).toFixed(2)}</span></div>
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><span>Total GST</span><span>Rs. {totalGST.toFixed(2)}</span></div>
          </div>
          <button className="btn-secondary w-full mt-4 text-xs">Export GST Report</button>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Recent Expenses</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[300px]">
              <thead><tr className="border-b border-border">
                <th className="pb-2 text-left text-xs text-muted-foreground">Category</th>
                <th className="pb-2 text-left text-xs text-muted-foreground">Description</th>
                <th className="pb-2 text-right text-xs text-muted-foreground">Amount</th>
              </tr></thead>
              <tbody>{expenses.map(e => (
                <tr key={e.id} className="border-b border-border last:border-0">
                  <td className="py-2"><span className="badge badge-info">{e.category}</span></td>
                  <td className="py-2 text-muted-foreground">{e.description}</td>
                  <td className="py-2 text-right font-medium">Rs. {e.amount.toLocaleString()}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
