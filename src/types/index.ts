export interface Medicine {
  id: string;
  name: string;
  genericName: string;
  manufacturer: string;
  category: 'Tablet' | 'Syrup' | 'Injection' | 'Capsule' | 'Cream' | 'Drops' | 'Powder' | 'Inhaler';
  salt: string;
  batchNumber: string;
  expiryDate: string;
  mrp: number;
  purchasePrice: number;
  quantity: number;
  minStock: number;
  unit: 'Tablet' | 'Strip' | 'Box' | 'Bottle' | 'Tube' | 'Vial' | 'Sachet';
  unitsPerPack: number;
  binLocation: string;
  scheduleType: 'OTC' | 'H' | 'H1' | 'X' | 'Narcotic';
  gstRate: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  loyaltyPoints: number;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  registrationNo: string;
  phone: string;
  hospital?: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  gstNo: string;
  address: string;
  isActive: boolean;
}

export interface BillItem {
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  quantity: number;
  mrp: number;
  discount: number;
  gstRate: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  patientId?: string;
  patientName: string;
  doctorName?: string;
  items: BillItem[];
  subtotal: number;
  totalDiscount: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMethod: 'Cash' | 'Card' | 'UPI' | 'Credit' | 'Split';
  paymentDetails?: string;
  status: 'Completed' | 'Pending' | 'Returned';
  createdAt: string;
  createdBy: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  status: 'Draft' | 'Ordered' | 'Received' | 'Partial';
  createdAt: string;
}

export interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Pharmacist' | 'Cashier';
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'danger' | 'success';
  isRead: boolean;
  timestamp: string;
}

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMode: string;
}
