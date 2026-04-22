import type { Medicine, Patient, Bill, Supplier, PurchaseOrder, Notification, Expense, ActivityLog } from '../types';
import { mockMedicines, mockPatients, mockBills, mockSuppliers, mockPurchaseOrders, mockNotifications, mockExpenses, mockActivityLogs } from './mockData';

const STORAGE_KEYS = {
  medicines: 'purerx_medicines',
  patients: 'purerx_patients',
  bills: 'purerx_bills',
  suppliers: 'purerx_suppliers',
  purchaseOrders: 'purerx_purchase_orders',
  notifications: 'purerx_notifications',
  expenses: 'purerx_expenses',
  activityLogs: 'purerx_activity_logs',
} as const;

function getStore<T>(key: string, fallback: T[]): T[] {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  return JSON.parse(raw);
}

function setStore<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// Medicines
export async function getMedicines(): Promise<Medicine[]> {
  await delay();
  return getStore(STORAGE_KEYS.medicines, mockMedicines);
}

export async function addMedicine(med: Medicine): Promise<Medicine> {
  await delay();
  const all = getStore<Medicine>(STORAGE_KEYS.medicines, mockMedicines);
  all.push(med);
  setStore(STORAGE_KEYS.medicines, all);
  return med;
}

export async function updateMedicine(med: Medicine): Promise<Medicine> {
  await delay();
  const all = getStore<Medicine>(STORAGE_KEYS.medicines, mockMedicines);
  const idx = all.findIndex(m => m.id === med.id);
  if (idx >= 0) all[idx] = med;
  setStore(STORAGE_KEYS.medicines, all);
  return med;
}

// Patients
export async function getPatients(): Promise<Patient[]> {
  await delay();
  return getStore(STORAGE_KEYS.patients, mockPatients);
}

export async function addPatient(p: Patient): Promise<Patient> {
  await delay();
  const all = getStore<Patient>(STORAGE_KEYS.patients, mockPatients);
  all.push(p);
  setStore(STORAGE_KEYS.patients, all);
  return p;
}

// Bills
export async function getBills(): Promise<Bill[]> {
  await delay();
  return getStore(STORAGE_KEYS.bills, mockBills);
}

export async function addBill(bill: Bill): Promise<Bill> {
  await delay();
  const all = getStore<Bill>(STORAGE_KEYS.bills, mockBills);
  all.unshift(bill);
  setStore(STORAGE_KEYS.bills, all);
  return bill;
}

// Suppliers
export async function getSuppliers(): Promise<Supplier[]> {
  await delay();
  return getStore(STORAGE_KEYS.suppliers, mockSuppliers);
}

export async function addSupplier(s: Supplier): Promise<Supplier> {
  await delay();
  const all = getStore<Supplier>(STORAGE_KEYS.suppliers, mockSuppliers);
  all.push(s);
  setStore(STORAGE_KEYS.suppliers, all);
  return s;
}

// Purchase Orders
export async function getPurchaseOrders(): Promise<PurchaseOrder[]> {
  await delay();
  return getStore(STORAGE_KEYS.purchaseOrders, mockPurchaseOrders);
}

export async function addPurchaseOrder(po: PurchaseOrder): Promise<PurchaseOrder> {
  await delay();
  const all = getStore<PurchaseOrder>(STORAGE_KEYS.purchaseOrders, mockPurchaseOrders);
  all.push(po);
  setStore(STORAGE_KEYS.purchaseOrders, all);
  return po;
}

// Notifications
export async function getNotifications(): Promise<Notification[]> {
  await delay(100);
  return getStore(STORAGE_KEYS.notifications, mockNotifications);
}

export async function markNotificationRead(id: string): Promise<void> {
  await delay(100);
  const all = getStore<Notification>(STORAGE_KEYS.notifications, mockNotifications);
  const n = all.find(x => x.id === id);
  if (n) n.isRead = true;
  setStore(STORAGE_KEYS.notifications, all);
}

// Expenses
export async function getExpenses(): Promise<Expense[]> {
  await delay();
  return getStore(STORAGE_KEYS.expenses, mockExpenses);
}

export async function addExpense(e: Expense): Promise<Expense> {
  await delay();
  const all = getStore<Expense>(STORAGE_KEYS.expenses, mockExpenses);
  all.push(e);
  setStore(STORAGE_KEYS.expenses, all);
  return e;
}

// Activity Logs
export async function getActivityLogs(): Promise<ActivityLog[]> {
  await delay();
  return getStore(STORAGE_KEYS.activityLogs, mockActivityLogs);
}

export async function addActivityLog(log: ActivityLog): Promise<void> {
  await delay(50);
  const all = getStore<ActivityLog>(STORAGE_KEYS.activityLogs, mockActivityLogs);
  all.unshift(log);
  setStore(STORAGE_KEYS.activityLogs, all);
}

// Global search
export async function globalSearch(query: string): Promise<Array<{ type: string; id: string; label: string; sub: string }>> {
  await delay(100);
  const q = query.toLowerCase();
  const results: Array<{ type: string; id: string; label: string; sub: string }> = [];
  const meds = getStore<Medicine>(STORAGE_KEYS.medicines, mockMedicines);
  meds.filter(m => m.name.toLowerCase().includes(q) || m.salt.toLowerCase().includes(q) || m.genericName.toLowerCase().includes(q))
    .slice(0, 5).forEach(m => results.push({ type: 'Medicine', id: m.id, label: m.name, sub: m.manufacturer }));
  const bills = getStore<Bill>(STORAGE_KEYS.bills, mockBills);
  bills.filter(b => b.billNumber.toLowerCase().includes(q) || b.patientName.toLowerCase().includes(q))
    .slice(0, 3).forEach(b => results.push({ type: 'Bill', id: b.id, label: b.billNumber, sub: b.patientName }));
  const patients = getStore<Patient>(STORAGE_KEYS.patients, mockPatients);
  patients.filter(p => p.name.toLowerCase().includes(q) || p.phone.includes(q))
    .slice(0, 3).forEach(p => results.push({ type: 'Patient', id: p.id, label: p.name, sub: p.phone }));
  return results;
}
