import { useState, useEffect, useMemo } from 'react';
import { getMedicines, addMedicine } from '../services/api';
import type { Medicine } from '../types';
import { SkeletonTable, EmptyState } from './Skeleton';
import { IconPlus, IconSearch, IconFilter, IconArrowUp, IconArrowDown } from './icons';

function AddMedicineModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: () => void }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', genericName: '', manufacturer: '', category: 'Tablet' as Medicine['category'],
    salt: '', batchNumber: '', expiryDate: '', mrp: '', purchasePrice: '',
    quantity: '', minStock: '50', unit: 'Strip' as Medicine['unit'], unitsPerPack: '10',
    binLocation: '', scheduleType: 'OTC' as Medicine['scheduleType'], gstRate: '12',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const med: Medicine = {
      id: `m_${Date.now()}`, ...form,
      mrp: Number(form.mrp), purchasePrice: Number(form.purchasePrice),
      quantity: Number(form.quantity), minStock: Number(form.minStock),
      unitsPerPack: Number(form.unitsPerPack), gstRate: Number(form.gstRate),
      isActive: true, createdAt: new Date().toISOString().split('T')[0],
    };
    await addMedicine(med);
    setSaving(false);
    onSaved();
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-4 sm:mb-6">Add New Medicine</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {([
            ['name', 'Medicine Name'], ['genericName', 'Generic Name'], ['manufacturer', 'Manufacturer'],
            ['salt', 'Salt/Composition'], ['batchNumber', 'Batch Number'], ['binLocation', 'Bin/Rack Location'],
            ['mrp', 'MRP (Rs.)'], ['purchasePrice', 'Purchase Price'], ['quantity', 'Quantity'],
            ['minStock', 'Min Stock Level'],
          ] as const).map(([key, label]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
              <input value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} required={['name', 'batchNumber', 'mrp', 'quantity'].includes(key)} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
            <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as Medicine['category'] }))} className="input-field">
              {['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Powder', 'Inhaler'].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Expiry Date</label>
            <input type="date" value={form.expiryDate} onChange={e => setForm(p => ({ ...p, expiryDate: e.target.value }))} required className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Unit</label>
            <select value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value as Medicine['unit'] }))} className="input-field">
              {['Tablet', 'Strip', 'Box', 'Bottle', 'Tube', 'Vial', 'Sachet'].map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">Schedule</label>
            <select value={form.scheduleType} onChange={e => setForm(p => ({ ...p, scheduleType: e.target.value as Medicine['scheduleType'] }))} className="input-field">
              {['OTC', 'H', 'H1', 'X', 'Narcotic'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="col-span-1 sm:col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Adding...' : 'Add Medicine'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<keyof Medicine | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [modalOpen, setModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const loadData = () => {
    getMedicines().then(m => { setMedicines(m); setIsLoading(false); });
  };

  useEffect(() => { loadData(); }, []);

  const filtered = useMemo(() => {
    let data = medicines;
    if (filterCategory) data = data.filter(m => m.category === filterCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(m => m.name.toLowerCase().includes(q) || m.salt.toLowerCase().includes(q) || m.manufacturer.toLowerCase().includes(q));
    }
    if (sortKey) {
      data = [...data].sort((a, b) => {
        const av = a[sortKey], bv = b[sortKey];
        const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv));
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }
    return data;
  }, [medicines, filterCategory, search, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: keyof Medicine) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: keyof Medicine }) => {
    if (sortKey !== col) return null;
    return sortDir === 'asc' ? <IconArrowUp className="h-3 w-3 inline ml-1" /> : <IconArrowDown className="h-3 w-3 inline ml-1" />;
  };

  if (isLoading) return <div className="space-y-4"><div className="skeleton h-10 w-64" /><SkeletonTable rows={8} /></div>;

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">{medicines.length} medicines in stock</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary self-start sm:self-auto">
          <IconPlus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input placeholder="Search by name, salt, manufacturer..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="input-field !pl-10" />
        </div>
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <select value={filterCategory} onChange={e => { setFilterCategory(e.target.value); setPage(0); }} className="input-field !w-auto">
            <option value="">All Categories</option>
            {['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Powder', 'Inhaler'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {([
                  ['name', 'Medicine'], ['category', 'Category'], ['batchNumber', 'Batch'],
                  ['quantity', 'Stock'], ['mrp', 'MRP'], ['expiryDate', 'Expiry'],
                  ['binLocation', 'Location'], ['manufacturer', 'Mfg'],
                ] as [keyof Medicine, string][]).map(([key, label]) => (
                  <th key={key} className="px-3 sm:px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer select-none" onClick={() => toggleSort(key)}>
                    {label}<SortIcon col={key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 ? (
                <tr><td colSpan={8}><EmptyState message="No medicines found" /></td></tr>
              ) : pageData.map(m => {
                const daysToExpiry = Math.ceil((new Date(m.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                return (
                  <tr key={m.id} className="border-b border-border last:border-0 table-row-hover">
                    <td className="px-3 sm:px-4 py-3"><p className="font-medium text-foreground">{m.name}</p><p className="text-xs text-muted-foreground">{m.salt}</p></td>
                    <td className="px-3 sm:px-4 py-3"><span className="badge badge-info">{m.category}</span></td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground">{m.batchNumber}</td>
                    <td className="px-3 sm:px-4 py-3"><span className={m.quantity <= m.minStock ? 'font-semibold text-destructive' : 'text-foreground'}>{m.quantity} {m.unit}s</span></td>
                    <td className="px-3 sm:px-4 py-3">Rs. {m.mrp}</td>
                    <td className="px-3 sm:px-4 py-3"><span className={daysToExpiry <= 30 ? 'text-destructive font-medium' : daysToExpiry <= 90 ? 'text-warning' : 'text-muted-foreground'}>{new Date(m.expiryDate).toLocaleDateString()}</span></td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground">{m.binLocation}</td>
                    <td className="px-3 sm:px-4 py-3 text-muted-foreground">{m.manufacturer}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">Page {page + 1} of {totalPages}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-40">Previous</button>
            <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <AddMedicineModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={loadData} />
    </div>
  );
}
