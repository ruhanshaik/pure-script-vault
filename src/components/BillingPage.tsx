import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMedicines, getBills, addBill } from '../services/api';
import type { Medicine, Bill, BillItem } from '../types';
import { IconSearch, IconPlus, IconTrash, IconPrint, IconEye, IconClose } from './icons';
import { EmptyState, SkeletonTable } from './Skeleton';

function BillViewModal({ bill, onClose }: { bill: Bill | null; onClose: () => void }) {
  if (!bill) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Bill #{bill.billNumber}</h2>
          <button onClick={onClose} className="btn-secondary !p-1.5"><IconClose className="h-4 w-4" /></button>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Patient</span><span className="font-medium">{bill.patientName}</span></div>
          {bill.doctorName && <div className="flex justify-between"><span className="text-muted-foreground">Doctor</span><span>{bill.doctorName}</span></div>}
          <div className="flex justify-between"><span className="text-muted-foreground">Date</span><span>{new Date(bill.createdAt).toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="badge badge-info">{bill.paymentMethod}</span></div>
        </div>
        <table className="w-full text-sm mt-4">
          <thead><tr className="border-b border-border"><th className="pb-2 text-left text-xs text-muted-foreground">Item</th><th className="pb-2 text-right text-xs text-muted-foreground">Qty</th><th className="pb-2 text-right text-xs text-muted-foreground">MRP</th><th className="pb-2 text-right text-xs text-muted-foreground">Total</th></tr></thead>
          <tbody>{bill.items.map((item, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className="py-2">{item.medicineName}</td><td className="py-2 text-right">{item.quantity}</td>
              <td className="py-2 text-right">Rs. {item.mrp}</td><td className="py-2 text-right font-medium">Rs. {item.total}</td>
            </tr>
          ))}</tbody>
        </table>
        <div className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {bill.subtotal.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>- Rs. {bill.totalDiscount.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>Rs. {bill.cgst.toFixed(2)}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>Rs. {bill.sgst.toFixed(2)}</span></div>
          <div className="flex justify-between text-base font-bold border-t border-border pt-2"><span>Grand Total</span><span>Rs. {bill.grandTotal.toFixed(2)}</span></div>
        </div>
        <button onClick={() => window.print()} className="btn-primary w-full mt-4"><IconPrint className="h-4 w-4" /> Print Bill</button>
      </div>
    </div>
  );
}

function NewBillPanel({ onCreated }: { onCreated: () => void }) {
  const queryClient = useQueryClient();
  const { data: medicines = [] } = useQuery({ queryKey: ['medicines'], queryFn: getMedicines });
  const mutation = useMutation({
    mutationFn: addBill,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['bills'] }); onCreated(); },
  });

  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<Bill['paymentMethod']>('Cash');
  const [items, setItems] = useState<BillItem[]>([]);
  const [searchMed, setSearchMed] = useState('');

  const filteredMeds = useMemo(() => {
    if (!searchMed.trim()) return [];
    const q = searchMed.toLowerCase();
    return medicines.filter(m => m.name.toLowerCase().includes(q) || m.salt.toLowerCase().includes(q)).slice(0, 5);
  }, [searchMed, medicines]);

  const addItem = (med: Medicine) => {
    if (items.find(i => i.medicineId === med.id)) return;
    setItems(prev => [...prev, {
      medicineId: med.id, medicineName: med.name, batchNumber: med.batchNumber,
      quantity: 1, mrp: med.mrp, discount: 0, gstRate: med.gstRate, total: med.mrp,
    }]);
    setSearchMed('');
  };

  const updateItem = (idx: number, field: string, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      const updated = { ...item, [field]: value };
      updated.total = (updated.mrp * updated.quantity) - updated.discount;
      return updated;
    }));
  };

  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const totalDiscount = items.reduce((s, i) => s + i.discount, 0);
  const cgst = items.reduce((s, i) => s + (i.total * i.gstRate / 200), 0);
  const sgst = cgst;
  const grandTotal = subtotal + cgst + sgst;

  const handleSubmit = () => {
    if (!items.length || !patientName.trim()) return;
    const bill: Bill = {
      id: `b_${Date.now()}`, billNumber: `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      patientName, doctorName: doctorName || undefined, items, subtotal, totalDiscount, cgst, sgst, grandTotal,
      paymentMethod, status: paymentMethod === 'Credit' ? 'Pending' : 'Completed',
      createdAt: new Date().toISOString(), createdBy: 'Admin',
    };
    mutation.mutate(bill);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-5">
      <h3 className="text-base font-bold text-foreground">New Bill</h3>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Patient Name</label>
          <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Walk-in Customer" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Doctor</label>
          <input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Optional" className="input-field" />
        </div>
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Payment Method</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as Bill['paymentMethod'])} className="input-field">
            {['Cash', 'Card', 'UPI', 'Credit', 'Split'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {/* Medicine search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input placeholder="Search medicine by name or salt..." value={searchMed} onChange={e => setSearchMed(e.target.value)} className="input-field !pl-10" />
        {filteredMeds.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 overflow-hidden">
            {filteredMeds.map(m => (
              <button key={m.id} onClick={() => addItem(m)} className="flex w-full items-center justify-between px-4 py-2.5 hover:bg-muted transition-colors text-left">
                <div><span className="text-sm font-medium text-foreground">{m.name}</span><span className="text-xs text-muted-foreground ml-2">{m.manufacturer}</span></div>
                <div className="text-right"><span className="text-sm font-medium">Rs. {m.mrp}</span><span className="text-xs text-muted-foreground ml-2">Stock: {m.quantity}</span></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Items table */}
      {items.length > 0 ? (
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border">
            <th className="pb-2 text-left text-xs text-muted-foreground">Medicine</th>
            <th className="pb-2 text-center text-xs text-muted-foreground w-20">Qty</th>
            <th className="pb-2 text-right text-xs text-muted-foreground">MRP</th>
            <th className="pb-2 text-center text-xs text-muted-foreground w-24">Discount</th>
            <th className="pb-2 text-right text-xs text-muted-foreground">Total</th>
            <th className="pb-2 w-10" />
          </tr></thead>
          <tbody>{items.map((item, idx) => (
            <tr key={idx} className="border-b border-border last:border-0">
              <td className="py-2"><span className="font-medium">{item.medicineName}</span><span className="text-xs text-muted-foreground ml-1">({item.batchNumber})</span></td>
              <td className="py-2"><input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', Number(e.target.value))} className="input-field !w-16 !text-center !py-1 mx-auto" /></td>
              <td className="py-2 text-right">Rs. {item.mrp}</td>
              <td className="py-2"><input type="number" min={0} value={item.discount} onChange={e => updateItem(idx, 'discount', Number(e.target.value))} className="input-field !w-20 !text-center !py-1 mx-auto" /></td>
              <td className="py-2 text-right font-medium">Rs. {item.total.toFixed(2)}</td>
              <td className="py-2 text-center"><button onClick={() => removeItem(idx)} className="text-destructive hover:opacity-70"><IconTrash className="h-4 w-4" /></button></td>
            </tr>
          ))}</tbody>
        </table>
      ) : (
        <div className="py-8 text-center text-sm text-muted-foreground">Search and add medicines to the bill</div>
      )}

      {items.length > 0 && (
        <div className="flex justify-between items-end">
          <div />
          <div className="w-72 space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span>- Rs. {totalDiscount.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">CGST</span><span>Rs. {cgst.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">SGST</span><span>Rs. {sgst.toFixed(2)}</span></div>
            <div className="flex justify-between text-base font-bold border-t border-border pt-2"><span>Grand Total</span><span>Rs. {grandTotal.toFixed(2)}</span></div>
            <button onClick={handleSubmit} disabled={mutation.isPending} className="btn-primary w-full !mt-3">
              {mutation.isPending ? 'Creating...' : 'Create Bill'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function BillingPage() {
  const { data: bills = [], isLoading } = useQuery({ queryKey: ['bills'], queryFn: getBills });
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [showNew, setShowNew] = useState(true);

  if (isLoading) return <div className="space-y-4"><SkeletonTable rows={6} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Billing & POS</h1>
          <p className="text-sm text-muted-foreground">{bills.length} total bills</p>
        </div>
        <button onClick={() => setShowNew(!showNew)} className="btn-primary">
          <IconPlus className="h-4 w-4" /> {showNew ? 'Hide New Bill' : 'New Bill'}
        </button>
      </div>

      {showNew && <NewBillPanel onCreated={() => {}} />}

      {/* Bill history */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border"><h3 className="text-sm font-semibold text-foreground">Bill History</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-border bg-muted/40">
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Bill No</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Patient</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Items</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Payment</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
            <th className="px-4 py-3 w-20" />
          </tr></thead>
          <tbody>
            {bills.length === 0 ? (
              <tr><td colSpan={8}><EmptyState message="No bills yet" /></td></tr>
            ) : bills.map(b => (
              <tr key={b.id} className="border-b border-border last:border-0 table-row-hover">
                <td className="px-4 py-3 font-medium text-foreground">{b.billNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.patientName}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.items.length}</td>
                <td className="px-4 py-3 text-right font-medium">Rs. {b.grandTotal.toFixed(2)}</td>
                <td className="px-4 py-3 text-center"><span className="badge badge-info">{b.paymentMethod}</span></td>
                <td className="px-4 py-3 text-center"><span className={`badge ${b.status === 'Completed' ? 'badge-success' : b.status === 'Pending' ? 'badge-warning' : 'badge-danger'}`}>{b.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{new Date(b.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setViewBill(b)} className="text-primary hover:opacity-70"><IconEye className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <BillViewModal bill={viewBill} onClose={() => setViewBill(null)} />
    </div>
  );
}
