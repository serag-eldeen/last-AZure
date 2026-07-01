export interface AdminDoctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  role: string;
  image?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface InsuranceInfo {
  provider: string;
  policyNumber: string;
  discountPercent: number;
}

export interface ExtendedPatient {
  id: string; // e.g. PAT-102040
  name: string;
  phone: string;
  email: string;
  password?: string;
  bloodType: string;
  emergencyContact: EmergencyContact;
  medicalConditions: string[];
  allergies: string[];
  insurance: InsuranceInfo;
  photoUrl?: string;
  isActive: boolean; // Active / Inactive
  totalSpent: number;
  outstandingBalance: number;
  lastVisit?: string;
  createdAt: string;
}

export type AppointmentStatus = 'Scheduled' | 'Confirmed' | 'Completed' | 'Cancelled' | 'No Show';

export interface AdminAppointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  doctorEmail: string; // amr.eladawy@gmail.com or basel.elmorsy@gmail.com
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // in minutes (e.g. 30, 45, 60)
  visitType: 'Consultation' | 'Treatment' | 'FollowUp' | 'Emergency';
  chairId: 'Chair 1' | 'Chair 2' | 'Chair 3';
  consultationFee: number;
  paymentMethod: 'Cash' | 'Card' | 'InstaPay' | 'Insurance';
  status: AppointmentStatus;
  notes?: string;
  isOnline?: boolean;
  createdAt: string;
}

export type ToothCondition = 
  | 'Healthy' 
  | 'Cavity' 
  | 'Filling' 
  | 'Root Canal' 
  | 'Extraction' 
  | 'Crown' 
  | 'Bridge' 
  | 'Implant' 
  | 'Orthodontics' 
  | 'Missing';

export interface ToothSurfaces {
  top: boolean;     // Occlusal/Incisal
  bottom: boolean;  // Lingual/Palatal
  left: boolean;    // Mesial
  right: boolean;   // Distal
  center: boolean;  // Buccal/Labial
}

export interface ToothState {
  toothNumber: number;
  condition: ToothCondition;
  surfaces: ToothSurfaces;
  notes?: string;
  treatmentDate?: string;
}

export interface DentalChart {
  patientId: string;
  teeth: Record<number, ToothState>; // toothNumber -> ToothState
}

export type TreatmentStatus = 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';

export interface TreatmentSession {
  id: string;
  date: string;
  notes: string;
  completed: boolean;
  affectedTeeth: number[];
  toothCondition: ToothCondition;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  description: string;
  status: TreatmentStatus;
  sessions: TreatmentSession[];
  totalCost: number;
  paidAmount: number;
  createdAt: string;
}

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  method: 'Cash' | 'Card' | 'InstaPay' | 'Insurance';
  notes?: string;
}

export interface Invoice {
  id: string; // e.g. INV-2026-0001
  patientId: string;
  appointmentId?: string;
  treatmentPlanId?: string;
  date: string;
  dueDate: string;
  items: InvoiceItem[];
  discount: number; // absolute discount in EGP
  tax: number; // percentage tax rate, e.g. 14 for 14%
  status: InvoiceStatus;
  payments: Payment[];
  totalAmount: number; // after discount and tax
  paidAmount: number;
  createdAt: string;
}

export type ExpenseCategory = string;

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  receiptUrl?: string;
  createdAt: string;
  notes?: string;

  // Supports both key conventions
  description?: string;
  supplier?: string;
  title?: string;
  payee?: string;
}

export type InventoryCategory = string;
export type StockStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';

export interface InventoryItem {
  id: string;
  name: string;
  category: InventoryCategory;
  sku: string;
  quantity: number;
  supplier: string;
  unitPrice: number;
  minQuantity: number;
  expirationDate?: string;
  storageLocation: string;
  status: StockStatus;
  createdAt: string;
}

export type NotificationType = 'Appointments' | 'Payments' | 'Inventory' | 'Patients' | 'Treatments' | 'System';
export type NotificationPriority = 'Low' | 'Medium' | 'High';

export interface ClinicNotification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
  patientId?: string;
}

export type AdminNotification = ClinicNotification;


export interface ProfitTransaction {
  id: string;
  paymentId: string;
  invoiceId: string;
  date: string; // YYYY-MM-DD
  amount: number;
  type: 'Appointment' | 'Treatment' | 'Manual';
  drAmrShare: number;
  drBaselShare: number;
  createdAt: string;
}

export interface DoctorProfitDistribution {
  doctorEmail: string;
  doctorName: string;
  appointmentRevenue: number;
  treatmentRevenue: number;
  manualInvoiceRevenue: number;
  totalGrossRevenue: number;
  shareOfExpenses: number;
  netProfit: number;
}

export interface MonthlyProfitReport {
  month: string; // YYYY-MM
  totalRevenue: number;
  totalExpenses: number;
  totalNetProfit: number;
  unpaidInvoicesSum: number;
  unpaidTreatmentsSum: number;
  unpaidConsultationsSum: number;
  distributions: Record<string, DoctorProfitDistribution>; // doctorEmail -> distribution
  
  // Monthly Closing / Settlement Snapshot extensions
  isLocked?: boolean;
  closedAt?: string;
  closedBy?: string;
  profitTransactions?: ProfitTransaction[];
  clinicRevenue?: number;
  appointmentRevenue?: number;
  treatmentRevenue?: number;
  drAmrEarnings?: number;
  drBaselEarnings?: number;
  expenseDeductions?: Record<string, number>;
  manualInvoiceDistribution?: Record<string, number>;
}
