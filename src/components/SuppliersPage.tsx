import { useQuery } from '@tanstack/react-query';
import { getSuppliers, getPurchaseOrders } from '../services/api';
import { SkeletonTable, EmptyState } from './Skeleton';

export function SuppliersPage() {
  const { data: suppliers = [], isLoading: sLoading } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
  const { data: pos = [], isLoading: poLoading } = useQuery({ queryKey: ['purchaseOrders'], queryFn: getPurchaseOrders });
  const isLoading = sLoading || poLoading;
  if (isLoading) return <SkeletonTable rows={5} />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Suppliers & Purchasing</h1>
        <p className="text-sm text-muted-foreground">{suppliers.length} suppliers, {pos.length} purchase orders</p>
      </div>

      {/* Suppliers */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Supplier Master</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phone</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">GST No</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
          </tr></thead>
          <tbody>{suppliers.map(s => (
            <tr key={s.id} className="border-b border-border last:border-0 table-row-hover">
              <td className="px-4 py-3 font-medium text-foreground">{s.name}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.contactPerson}</td>
              <td className="px-4 py-3 text-muted-foreground">{s.phone}</td>
              <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{s.gstNo}</td>
              <td className="px-4 py-3 text-center"><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Purchase Orders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Purchase Orders</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">PO Number</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
          </tr></thead>
          <tbody>
            {pos.length === 0 ? (
              <tr><td colSpan={5}><EmptyState message="No purchase orders" /></td></tr>
            ) : pos.map(po => (
              <tr key={po.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-4 py-3 font-medium text-foreground">{po.poNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{po.supplierName}</td>
                <td className="px-4 py-3 text-right font-medium">Rs. {po.totalAmount.toLocaleString()}</td>
                <td className="px-4 py-3 text-center"><span className={`badge ${po.status === 'Received' ? 'badge-success' : po.status === 'Ordered' ? 'badge-info' : 'badge-warning'}`}>{po.status}</span></td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(po.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
