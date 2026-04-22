import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getMedicines, getBills } from '../services/api';
import { SkeletonChart, SkeletonTable } from './Skeleton';

export function ReportsPage() {
  const { data: medicines = [], isLoading: mL } = useQuery({ queryKey: ['medicines'], queryFn: getMedicines });
  const { data: bills = [], isLoading: bL } = useQuery({ queryKey: ['bills'], queryFn: getBills });
  const isLoading = mL || bL;

  const inventoryValue = medicines.reduce((s, m) => s + m.mrp * m.quantity, 0);
  const fastMoving = medicines.slice().sort((a, b) => a.quantity - b.quantity).slice(0, 5);
  const dailySales = bills.reduce<Record<string, number>>((acc, b) => {
    const d = new Date(b.createdAt).toLocaleDateString();
    acc[d] = (acc[d] || 0) + b.grandTotal;
    return acc;
  }, {});
  const dailySalesData = Object.entries(dailySales).map(([date, amount]) => ({ date, amount: Math.round(amount) }));

  if (isLoading) return <div className="space-y-6"><SkeletonChart /><SkeletonTable /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Reports & Analytics</h1>
        <p className="text-sm text-muted-foreground">Sales summaries, inventory valuation, and insights</p>
      </div>

      <div className="grid grid-cols-3 gap-5">
        <div className="kpi-card"><p className="text-sm text-muted-foreground">Inventory Valuation</p><p className="text-2xl font-bold mt-2">Rs. {inventoryValue.toLocaleString('en-IN')}</p></div>
        <div className="kpi-card"><p className="text-sm text-muted-foreground">Total Bills</p><p className="text-2xl font-bold mt-2">{bills.length}</p></div>
        <div className="kpi-card"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold mt-2">Rs. {bills.reduce((s, b) => s + b.grandTotal, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p></div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Daily Sales Summary</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={dailySalesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} />
            <Tooltip contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="amount" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="text-sm font-semibold text-foreground mb-4">Fast Moving Items (Low Stock)</h3>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="pb-2 text-left text-xs text-muted-foreground">Medicine</th>
            <th className="pb-2 text-right text-xs text-muted-foreground">Current Stock</th>
            <th className="pb-2 text-right text-xs text-muted-foreground">Min Stock</th>
            <th className="pb-2 text-right text-xs text-muted-foreground">MRP</th>
          </tr></thead>
          <tbody>{fastMoving.map(m => (
            <tr key={m.id} className="border-b border-border last:border-0">
              <td className="py-2.5 font-medium">{m.name}</td>
              <td className="py-2.5 text-right"><span className={m.quantity <= m.minStock ? 'text-destructive font-medium' : ''}>{m.quantity}</span></td>
              <td className="py-2.5 text-right text-muted-foreground">{m.minStock}</td>
              <td className="py-2.5 text-right">Rs. {m.mrp}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
