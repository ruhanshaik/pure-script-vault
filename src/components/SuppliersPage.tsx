import { useState, useEffect } from 'react';
import { getSuppliers, getPurchaseOrders } from '../services/api';
import type { Supplier, PurchaseOrder } from '../types';
import { SkeletonTable, EmptyState } from './Skeleton';

export function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSuppliers(), getPurchaseOrders()]).then(([s, p]) => {
      setSuppliers(s); setPos(p); setIsLoading(false);
    });
  }, []);

  if (isLoading) return <SkeletonTable rows={5} />;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-lg sm:text-xl font-bold text-foreground">Suppliers & Purchasing</h1>
        <p className="text-xs sm:text-sm text-muted-foreground">{suppliers.length} suppliers, {pos.length} purchase orders</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Supplier Master</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Contact</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Phone</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">GST No</th>
              <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
            </tr></thead>
            <tbody>{suppliers.map(s => (
              <tr key={s.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-3 sm:px-4 py-3 font-medium text-foreground">{s.name}</td>
                <td className="px-3 sm:px-4 py-3 text-muted-foreground">{s.contactPerson}</td>
                <td className="px-3 sm:px-4 py-3 text-muted-foreground">{s.phone}</td>
                <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground font-mono">{s.gstNo}</td>
                <td className="px-3 sm:px-4 py-3 text-center"><span className={`badge ${s.isActive ? 'badge-success' : 'badge-danger'}`}>{s.isActive ? 'Active' : 'Inactive'}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-4 sm:px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Purchase Orders</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[500px]">
            <thead><tr className="border-b border-border bg-muted/40">
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">PO Number</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Supplier</th>
              <th className="px-3 sm:px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
              <th className="px-3 sm:px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
              <th className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
            </tr></thead>
            <tbody>
              {pos.length === 0 ? (
                <tr><td colSpan={5}><EmptyState message="No purchase orders" /></td></tr>
              ) : pos.map(po => (
                <tr key={po.id} className="border-b border-border last:border-0 table-row-hover">
                  <td className="px-3 sm:px-4 py-3 font-medium text-foreground">{po.poNumber}</td>
                  <td className="px-3 sm:px-4 py-3 text-muted-foreground">{po.supplierName}</td>
                  <td className="px-3 sm:px-4 py-3 text-right font-medium">Rs. {po.totalAmount.toLocaleString()}</td>
                  <td className="px-3 sm:px-4 py-3 text-center"><span className={`badge ${po.status === 'Received' ? 'badge-success' : po.status === 'Ordered' ? 'badge-info' : 'badge-warning'}`}>{po.status}</span></td>
                  <td className="px-3 sm:px-4 py-3 text-xs text-muted-foreground">{new Date(po.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
