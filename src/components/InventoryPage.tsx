import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel, getPaginationRowModel, flexRender, createColumnHelper, type SortingState } from '@tanstack/react-table';
import { getMedicines, addMedicine } from '../services/api';
import type { Medicine } from '../types';
import { SkeletonTable, EmptyState } from './Skeleton';
import { IconPlus, IconSearch, IconFilter, IconArrowUp, IconArrowDown } from './icons';

const columnHelper = createColumnHelper<Medicine>();

function AddMedicineModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: addMedicine,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['medicines'] }); onClose(); },
  });

  const [form, setForm] = useState({
    name: '', genericName: '', manufacturer: '', category: 'Tablet' as Medicine['category'],
    salt: '', batchNumber: '', expiryDate: '', mrp: '', purchasePrice: '',
    quantity: '', minStock: '50', unit: 'Strip' as Medicine['unit'], unitsPerPack: '10',
    binLocation: '', scheduleType: 'OTC' as Medicine['scheduleType'], gstRate: '12',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const med: Medicine = {
      id: `m_${Date.now()}`, ...form,
      mrp: Number(form.mrp), purchasePrice: Number(form.purchasePrice),
      quantity: Number(form.quantity), minStock: Number(form.minStock),
      unitsPerPack: Number(form.unitsPerPack), gstRate: Number(form.gstRate),
      isActive: true, createdAt: new Date().toISOString().split('T')[0],
    };
    mutation.mutate(med);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-bold text-foreground mb-6">Add New Medicine</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
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
          <div className="col-span-2 flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={mutation.isPending}>
              {mutation.isPending ? 'Adding...' : 'Add Medicine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function InventoryPage() {
  const { data: medicines = [], isLoading } = useQuery({ queryKey: ['medicines'], queryFn: getMedicines });
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');

  const filtered = useMemo(() => {
    let data = medicines;
    if (filterCategory) data = data.filter(m => m.category === filterCategory);
    return data;
  }, [medicines, filterCategory]);

  const columns = useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Medicine',
      cell: info => (
        <div>
          <p className="font-medium text-foreground">{info.getValue()}</p>
          <p className="text-xs text-muted-foreground">{info.row.original.salt}</p>
        </div>
      ),
    }),
    columnHelper.accessor('category', { header: 'Category', cell: info => <span className="badge badge-info">{info.getValue()}</span> }),
    columnHelper.accessor('batchNumber', { header: 'Batch' }),
    columnHelper.accessor('quantity', {
      header: 'Stock',
      cell: info => {
        const q = info.getValue();
        const min = info.row.original.minStock;
        return <span className={q <= min ? 'font-semibold text-destructive' : 'text-foreground'}>{q} {info.row.original.unit}s</span>;
      },
    }),
    columnHelper.accessor('mrp', { header: 'MRP', cell: info => `Rs. ${info.getValue()}` }),
    columnHelper.accessor('expiryDate', {
      header: 'Expiry',
      cell: info => {
        const d = new Date(info.getValue());
        const days = Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return (
          <span className={days <= 30 ? 'text-destructive font-medium' : days <= 90 ? 'text-warning' : 'text-muted-foreground'}>
            {d.toLocaleDateString()}
          </span>
        );
      },
    }),
    columnHelper.accessor('binLocation', { header: 'Location' }),
    columnHelper.accessor('manufacturer', { header: 'Mfg' }),
  ], []);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter: search },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearch,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  if (isLoading) return <div className="space-y-4"><div className="skeleton h-10 w-64" /><SkeletonTable rows={8} /></div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">{medicines.length} medicines in stock</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary">
          <IconPlus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search by name, salt, manufacturer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field !pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <IconFilter className="h-4 w-4 text-muted-foreground" />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="input-field !w-auto">
            <option value="">All Categories</option>
            {['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Powder', 'Inhaler'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id} className="border-b border-border bg-muted/40">
                  {hg.headers.map(h => (
                    <th
                      key={h.id}
                      className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground cursor-pointer select-none"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {h.column.getIsSorted() === 'asc' && <IconArrowUp className="h-3 w-3" />}
                        {h.column.getIsSorted() === 'desc' && <IconArrowDown className="h-3 w-3" />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length}><EmptyState message="No medicines found" /></td></tr>
              ) : table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-border last:border-0 table-row-hover">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-40">Previous</button>
            <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} className="btn-secondary !py-1 !px-3 !text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>

      <AddMedicineModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
