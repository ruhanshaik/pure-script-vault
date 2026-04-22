import type { Medicine, Patient, Doctor, Supplier, Bill, PurchaseOrder, User, ActivityLog, Notification, Expense } from '../types';

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const daysAgo = (n: number) => { const d = new Date(today); d.setDate(d.getDate() - n); return fmt(d); };
const daysAhead = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return fmt(d); };

export const mockMedicines: Medicine[] = [
  { id: 'm1', name: 'Paracetamol 500mg', genericName: 'Paracetamol', manufacturer: 'Cipla', category: 'Tablet', salt: 'Paracetamol', batchNumber: 'BT2024001', expiryDate: daysAhead(180), mrp: 25, purchasePrice: 15, quantity: 500, minStock: 100, unit: 'Strip', unitsPerPack: 10, binLocation: 'A1-R1', scheduleType: 'OTC', gstRate: 12, isActive: true, createdAt: daysAgo(90) },
  { id: 'm2', name: 'Amoxicillin 250mg', genericName: 'Amoxicillin', manufacturer: 'Sun Pharma', category: 'Capsule', salt: 'Amoxicillin Trihydrate', batchNumber: 'BT2024002', expiryDate: daysAhead(25), mrp: 85, purchasePrice: 52, quantity: 45, minStock: 50, unit: 'Strip', unitsPerPack: 10, binLocation: 'A2-R3', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(60) },
  { id: 'm3', name: 'Cetirizine 10mg', genericName: 'Cetirizine', manufacturer: 'Dr Reddy\'s', category: 'Tablet', salt: 'Cetirizine Hydrochloride', batchNumber: 'BT2024003', expiryDate: daysAhead(365), mrp: 35, purchasePrice: 20, quantity: 300, minStock: 80, unit: 'Strip', unitsPerPack: 10, binLocation: 'B1-R2', scheduleType: 'OTC', gstRate: 12, isActive: true, createdAt: daysAgo(45) },
  { id: 'm4', name: 'Omeprazole 20mg', genericName: 'Omeprazole', manufacturer: 'Mankind', category: 'Capsule', salt: 'Omeprazole', batchNumber: 'BT2024004', expiryDate: daysAhead(55), mrp: 65, purchasePrice: 38, quantity: 120, minStock: 40, unit: 'Strip', unitsPerPack: 10, binLocation: 'B2-R1', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(30) },
  { id: 'm5', name: 'Metformin 500mg', genericName: 'Metformin', manufacturer: 'USV', category: 'Tablet', salt: 'Metformin Hydrochloride', batchNumber: 'BT2024005', expiryDate: daysAhead(240), mrp: 45, purchasePrice: 25, quantity: 200, minStock: 60, unit: 'Strip', unitsPerPack: 10, binLocation: 'C1-R1', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(20) },
  { id: 'm6', name: 'Cough Syrup', genericName: 'Dextromethorphan', manufacturer: 'Cipla', category: 'Syrup', salt: 'Dextromethorphan HBr', batchNumber: 'BT2024006', expiryDate: daysAhead(15), mrp: 95, purchasePrice: 58, quantity: 30, minStock: 20, unit: 'Bottle', unitsPerPack: 1, binLocation: 'D1-R2', scheduleType: 'OTC', gstRate: 12, isActive: true, createdAt: daysAgo(15) },
  { id: 'm7', name: 'Insulin Glargine', genericName: 'Insulin Glargine', manufacturer: 'Sanofi', category: 'Injection', salt: 'Insulin Glargine', batchNumber: 'BT2024007', expiryDate: daysAhead(90), mrp: 1250, purchasePrice: 950, quantity: 15, minStock: 10, unit: 'Vial', unitsPerPack: 1, binLocation: 'F1-R1', scheduleType: 'H', gstRate: 5, isActive: true, createdAt: daysAgo(10) },
  { id: 'm8', name: 'Betadine Cream', genericName: 'Povidone Iodine', manufacturer: 'Win Medicare', category: 'Cream', salt: 'Povidone Iodine', batchNumber: 'BT2024008', expiryDate: daysAhead(400), mrp: 55, purchasePrice: 32, quantity: 80, minStock: 25, unit: 'Tube', unitsPerPack: 1, binLocation: 'E1-R3', scheduleType: 'OTC', gstRate: 12, isActive: true, createdAt: daysAgo(7) },
  { id: 'm9', name: 'Azithromycin 500mg', genericName: 'Azithromycin', manufacturer: 'Alkem', category: 'Tablet', salt: 'Azithromycin Dihydrate', batchNumber: 'BT2024009', expiryDate: daysAhead(200), mrp: 120, purchasePrice: 72, quantity: 90, minStock: 30, unit: 'Strip', unitsPerPack: 3, binLocation: 'A3-R1', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(5) },
  { id: 'm10', name: 'Pantoprazole 40mg', genericName: 'Pantoprazole', manufacturer: 'Alkem', category: 'Tablet', salt: 'Pantoprazole Sodium', batchNumber: 'BT2024010', expiryDate: daysAhead(28), mrp: 75, purchasePrice: 42, quantity: 18, minStock: 30, unit: 'Strip', unitsPerPack: 10, binLocation: 'B3-R2', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(3) },
  { id: 'm11', name: 'Vitamin D3 60K', genericName: 'Cholecalciferol', manufacturer: 'USV', category: 'Capsule', salt: 'Cholecalciferol', batchNumber: 'BT2024011', expiryDate: daysAhead(500), mrp: 30, purchasePrice: 18, quantity: 400, minStock: 50, unit: 'Sachet', unitsPerPack: 4, binLocation: 'C2-R1', scheduleType: 'OTC', gstRate: 12, isActive: true, createdAt: daysAgo(2) },
  { id: 'm12', name: 'Salbutamol Inhaler', genericName: 'Salbutamol', manufacturer: 'Cipla', category: 'Inhaler', salt: 'Salbutamol Sulphate', batchNumber: 'BT2024012', expiryDate: daysAhead(300), mrp: 185, purchasePrice: 120, quantity: 25, minStock: 10, unit: 'Box', unitsPerPack: 1, binLocation: 'F2-R1', scheduleType: 'H', gstRate: 12, isActive: true, createdAt: daysAgo(1) },
];

export const mockPatients: Patient[] = [
  { id: 'p1', name: 'Rajesh Kumar', phone: '9876543210', email: 'rajesh@email.com', address: '12, MG Road, Bangalore', loyaltyPoints: 250, createdAt: daysAgo(120) },
  { id: 'p2', name: 'Priya Sharma', phone: '9876543211', email: 'priya@email.com', address: '45, Park Street, Mumbai', loyaltyPoints: 180, createdAt: daysAgo(90) },
  { id: 'p3', name: 'Amit Patel', phone: '9876543212', loyaltyPoints: 420, createdAt: daysAgo(60) },
  { id: 'p4', name: 'Sunita Devi', phone: '9876543213', loyaltyPoints: 90, createdAt: daysAgo(30) },
  { id: 'p5', name: 'Mohammed Ali', phone: '9876543214', email: 'mali@email.com', address: '78, Anna Nagar, Chennai', loyaltyPoints: 310, createdAt: daysAgo(15) },
];

export const mockDoctors: Doctor[] = [
  { id: 'd1', name: 'Dr. Anil Kapoor', specialization: 'General Medicine', registrationNo: 'MCI-12345', phone: '9988776655', hospital: 'City Hospital' },
  { id: 'd2', name: 'Dr. Meena Reddy', specialization: 'Pediatrics', registrationNo: 'MCI-12346', phone: '9988776656', hospital: 'Apollo Clinic' },
  { id: 'd3', name: 'Dr. Suresh Verma', specialization: 'Cardiology', registrationNo: 'MCI-12347', phone: '9988776657', hospital: 'Max Healthcare' },
];

export const mockSuppliers: Supplier[] = [
  { id: 's1', name: 'MedSupply India', contactPerson: 'Vikram Singh', phone: '9112233445', email: 'vikram@medsupply.in', gstNo: '29AABCU9603R1ZM', address: 'Industrial Area, Phase 2, Bangalore', isActive: true },
  { id: 's2', name: 'PharmaDist Co.', contactPerson: 'Ravi Gupta', phone: '9112233446', email: 'ravi@pharmadist.com', gstNo: '27AABCU9603R1ZN', address: 'MIDC, Pune', isActive: true },
  { id: 's3', name: 'HealthLine Distributors', contactPerson: 'Sanjay Mehta', phone: '9112233447', email: 'sanjay@healthline.in', gstNo: '33AABCU9603R1ZO', address: 'Perungudi, Chennai', isActive: true },
];

export const mockBills: Bill[] = [
  { id: 'b1', billNumber: 'INV-2024-001', patientId: 'p1', patientName: 'Rajesh Kumar', doctorName: 'Dr. Anil Kapoor', items: [{ medicineId: 'm1', medicineName: 'Paracetamol 500mg', batchNumber: 'BT2024001', quantity: 2, mrp: 25, discount: 0, gstRate: 12, total: 50 }, { medicineId: 'm3', medicineName: 'Cetirizine 10mg', batchNumber: 'BT2024003', quantity: 1, mrp: 35, discount: 5, gstRate: 12, total: 30 }], subtotal: 80, totalDiscount: 5, cgst: 4.5, sgst: 4.5, grandTotal: 84, paymentMethod: 'Cash', status: 'Completed', createdAt: daysAgo(0) + 'T10:30:00Z', createdBy: 'Admin' },
  { id: 'b2', billNumber: 'INV-2024-002', patientId: 'p2', patientName: 'Priya Sharma', items: [{ medicineId: 'm5', medicineName: 'Metformin 500mg', batchNumber: 'BT2024005', quantity: 3, mrp: 45, discount: 0, gstRate: 12, total: 135 }], subtotal: 135, totalDiscount: 0, cgst: 8.1, sgst: 8.1, grandTotal: 151.2, paymentMethod: 'UPI', status: 'Completed', createdAt: daysAgo(0) + 'T11:15:00Z', createdBy: 'Admin' },
  { id: 'b3', billNumber: 'INV-2024-003', patientId: 'p3', patientName: 'Amit Patel', doctorName: 'Dr. Suresh Verma', items: [{ medicineId: 'm7', medicineName: 'Insulin Glargine', batchNumber: 'BT2024007', quantity: 1, mrp: 1250, discount: 50, gstRate: 5, total: 1200 }, { medicineId: 'm4', medicineName: 'Omeprazole 20mg', batchNumber: 'BT2024004', quantity: 2, mrp: 65, discount: 0, gstRate: 12, total: 130 }], subtotal: 1330, totalDiscount: 50, cgst: 37.8, sgst: 37.8, grandTotal: 1355.6, paymentMethod: 'Card', status: 'Completed', createdAt: daysAgo(1) + 'T14:00:00Z', createdBy: 'Admin' },
  { id: 'b4', billNumber: 'INV-2024-004', patientName: 'Walk-in Customer', items: [{ medicineId: 'm6', medicineName: 'Cough Syrup', batchNumber: 'BT2024006', quantity: 1, mrp: 95, discount: 0, gstRate: 12, total: 95 }], subtotal: 95, totalDiscount: 0, cgst: 5.7, sgst: 5.7, grandTotal: 106.4, paymentMethod: 'Cash', status: 'Completed', createdAt: daysAgo(1) + 'T16:30:00Z', createdBy: 'Admin' },
  { id: 'b5', billNumber: 'INV-2024-005', patientId: 'p5', patientName: 'Mohammed Ali', items: [{ medicineId: 'm9', medicineName: 'Azithromycin 500mg', batchNumber: 'BT2024009', quantity: 1, mrp: 120, discount: 10, gstRate: 12, total: 110 }], subtotal: 110, totalDiscount: 10, cgst: 6, sgst: 6, grandTotal: 122, paymentMethod: 'Credit', status: 'Pending', createdAt: daysAgo(2) + 'T09:45:00Z', createdBy: 'Admin' },
  { id: 'b6', billNumber: 'INV-2024-006', patientId: 'p4', patientName: 'Sunita Devi', items: [{ medicineId: 'm11', medicineName: 'Vitamin D3 60K', batchNumber: 'BT2024011', quantity: 4, mrp: 30, discount: 0, gstRate: 12, total: 120 }], subtotal: 120, totalDiscount: 0, cgst: 7.2, sgst: 7.2, grandTotal: 134.4, paymentMethod: 'Cash', status: 'Completed', createdAt: daysAgo(3) + 'T12:00:00Z', createdBy: 'Admin' },
];

export const mockPurchaseOrders: PurchaseOrder[] = [
  { id: 'po1', poNumber: 'PO-2024-001', supplierId: 's1', supplierName: 'MedSupply India', items: [{ medicineId: 'm1', medicineName: 'Paracetamol 500mg', quantity: 200, unitPrice: 15, total: 3000 }, { medicineId: 'm3', medicineName: 'Cetirizine 10mg', quantity: 100, unitPrice: 20, total: 2000 }], totalAmount: 5000, status: 'Received', createdAt: daysAgo(10) },
  { id: 'po2', poNumber: 'PO-2024-002', supplierId: 's2', supplierName: 'PharmaDist Co.', items: [{ medicineId: 'm2', medicineName: 'Amoxicillin 250mg', quantity: 100, unitPrice: 52, total: 5200 }], totalAmount: 5200, status: 'Ordered', createdAt: daysAgo(3) },
  { id: 'po3', poNumber: 'PO-2024-003', supplierId: 's3', supplierName: 'HealthLine Distributors', items: [{ medicineId: 'm7', medicineName: 'Insulin Glargine', quantity: 20, unitPrice: 950, total: 19000 }], totalAmount: 19000, status: 'Draft', createdAt: daysAgo(1) },
];

export const mockUsers: User[] = [
  { id: 'u1', name: 'Admin User', email: 'Admin@gmail.com', role: 'Admin', isActive: true },
  { id: 'u2', name: 'Pharmacist One', email: 'pharma@gmail.com', role: 'Pharmacist', isActive: true },
  { id: 'u3', name: 'Cashier One', email: 'cashier@gmail.com', role: 'Cashier', isActive: true },
];

export const mockActivityLogs: ActivityLog[] = [
  { id: 'al1', userId: 'u1', userName: 'Admin User', action: 'Created bill', module: 'Billing', details: 'Bill INV-2024-001 created for Rajesh Kumar', timestamp: daysAgo(0) + 'T10:30:00Z' },
  { id: 'al2', userId: 'u1', userName: 'Admin User', action: 'Added stock', module: 'Inventory', details: 'Added 200 units of Paracetamol 500mg', timestamp: daysAgo(1) + 'T09:00:00Z' },
  { id: 'al3', userId: 'u2', userName: 'Pharmacist One', action: 'Created bill', module: 'Billing', details: 'Bill INV-2024-003 created for Amit Patel', timestamp: daysAgo(1) + 'T14:00:00Z' },
  { id: 'al4', userId: 'u1', userName: 'Admin User', action: 'Login', module: 'Auth', details: 'Admin logged in', timestamp: daysAgo(0) + 'T08:00:00Z' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', title: 'Low Stock Alert', message: 'Amoxicillin 250mg is below minimum stock level (45/50)', type: 'warning', isRead: false, timestamp: daysAgo(0) + 'T08:00:00Z' },
  { id: 'n2', title: 'Expiry Alert', message: 'Cough Syrup batch BT2024006 expires in 15 days', type: 'danger', isRead: false, timestamp: daysAgo(0) + 'T08:00:00Z' },
  { id: 'n3', title: 'Expiry Alert', message: 'Amoxicillin 250mg batch BT2024002 expires in 25 days', type: 'danger', isRead: false, timestamp: daysAgo(0) + 'T08:00:00Z' },
  { id: 'n4', title: 'Purchase Order Received', message: 'PO-2024-001 from MedSupply India has been received', type: 'success', isRead: true, timestamp: daysAgo(1) + 'T12:00:00Z' },
  { id: 'n5', title: 'Low Stock Alert', message: 'Pantoprazole 40mg is below minimum stock level (18/30)', type: 'warning', isRead: false, timestamp: daysAgo(0) + 'T09:00:00Z' },
  { id: 'n6', title: 'Credit Payment Pending', message: 'Mohammed Ali has pending payment of Rs. 122', type: 'info', isRead: true, timestamp: daysAgo(2) + 'T10:00:00Z' },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', category: 'Rent', description: 'Monthly shop rent', amount: 25000, date: daysAgo(5), paymentMode: 'Bank Transfer' },
  { id: 'e2', category: 'Electricity', description: 'Monthly electricity bill', amount: 3500, date: daysAgo(3), paymentMode: 'Cash' },
  { id: 'e3', category: 'Salary', description: 'Staff salary - Pharmacist', amount: 22000, date: daysAgo(2), paymentMode: 'Bank Transfer' },
  { id: 'e4', category: 'Maintenance', description: 'AC servicing', amount: 2000, date: daysAgo(1), paymentMode: 'Cash' },
];

export const weeklySalesData = [
  { day: 'Mon', sales: 4500, orders: 12 },
  { day: 'Tue', sales: 6200, orders: 18 },
  { day: 'Wed', sales: 3800, orders: 10 },
  { day: 'Thu', sales: 7100, orders: 22 },
  { day: 'Fri', sales: 5400, orders: 15 },
  { day: 'Sat', sales: 8900, orders: 28 },
  { day: 'Sun', sales: 3200, orders: 8 },
];

export const categorySalesData = [
  { name: 'Tablets', value: 42, fill: '#0d9488' },
  { name: 'Syrups', value: 18, fill: '#0ea5e9' },
  { name: 'Capsules', value: 22, fill: '#8b5cf6' },
  { name: 'Injections', value: 8, fill: '#f59e0b' },
  { name: 'Creams', value: 6, fill: '#ef4444' },
  { name: 'Others', value: 4, fill: '#6b7280' },
];

export const topMedicinesData = [
  { name: 'Paracetamol', sales: 1250 },
  { name: 'Amoxicillin', sales: 980 },
  { name: 'Cetirizine', sales: 870 },
  { name: 'Metformin', sales: 750 },
  { name: 'Omeprazole', sales: 620 },
];
