import { 
  AdminDoctor, ExtendedPatient, AdminAppointment, DentalChart, ToothState, 
  TreatmentPlan, Invoice, Expense, InventoryItem, ClinicNotification, MonthlyProfitReport,
  ToothCondition, ToothSurfaces, TreatmentSession, InvoiceItem, Payment, ProfitTransaction
} from './adminTypes';

// Initial Seed Doctors
export const SEED_DOCTORS: AdminDoctor[] = [
  {
    id: 'doc-amr',
    name: 'Dr. Amr El-Adawy',
    email: 'amr.eladawy@gmail.com',
    specialty: 'Oral Surgery & Implants',
    role: 'Senior Consultant / Co-founder',
    image: '/src/assets/images/doctor_expert_portrait_1782702895851.jpg'
  },
  {
    id: 'doc-basel',
    name: 'Dr. Basel El-Morsy',
    email: 'basel.elmorsy@gmail.com',
    specialty: 'Cosmetic Dentistry & Orthodontics',
    role: 'Senior Specialist / Co-founder',
    image: '/src/assets/images/dr_basel_portrait_1782801845110.jpg'
  }
];

// LocalStorage Keys
const KEYS = {
  DOCTORS: 'azure_erp_doctors',
  PATIENTS: 'azure_erp_patients',
  APPOINTMENTS: 'azure_erp_appointments',
  DENTAL_CHARTS: 'azure_erp_dental_charts',
  TREATMENTS: 'azure_erp_treatments',
  INVOICES: 'azure_erp_invoices',
  EXPENSES: 'azure_erp_expenses',
  INVENTORY: 'azure_erp_inventory',
  NOTIFICATIONS: 'azure_erp_notifications',
  SETTLEMENTS: 'azure_erp_settlements',
  PROFIT_TRANSACTIONS: 'azure_erp_profit_transactions',
  MONTH_LOCKS: 'azure_erp_month_locks'
};

// Generate default dental chart for adult or child
export function generateDefaultChart(patientId: string, isChild: boolean = false): DentalChart {
  const teeth: Record<number, ToothState> = {};
  const toothNumbers = isChild 
    ? [51, 52, 53, 54, 55, 61, 62, 63, 64, 65, 71, 72, 73, 74, 75, 81, 82, 83, 84, 85] // child teeth numbers
    : Array.from({ length: 32 }, (_, i) => i + 1); // 1 to 32 for adult

  toothNumbers.forEach(num => {
    teeth[num] = {
      toothNumber: num,
      condition: 'Healthy',
      surfaces: { top: false, bottom: false, left: false, right: false, center: false },
      notes: ''
    };
  });

  return { patientId, teeth };
}

// Initial Seed Data Generators
const initialPatientsSeed: ExtendedPatient[] = [
  {
    id: 'PAT-829402',
    name: 'سارة عبد الرحمن منصور',
    phone: '01039591109',
    email: 'sara@example.com',
    password: '123',
    bloodType: 'A+',
    emergencyContact: {
      name: 'أحمد منصور (الأب)',
      phone: '01012345678',
      relation: 'أب'
    },
    medicalConditions: ['حساسية ليفية خفيفة', 'ضغط دم منخفض'],
    allergies: ['البنسلين', 'مأكولات بحرية'],
    insurance: {
      provider: 'مصر للتأمين',
      policyNumber: 'MS-99402-A',
      discountPercent: 15
    },
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150',
    isActive: true,
    totalSpent: 4500,
    outstandingBalance: 1200,
    lastVisit: '2026-06-20',
    createdAt: '2026-05-15T10:00:00.000Z'
  },
  {
    id: 'PAT-402941',
    name: 'محمد علي البدري',
    phone: '01124567890',
    email: 'mohamed@example.com',
    password: '123',
    bloodType: 'O+',
    emergencyContact: {
      name: 'منى البدري (الزوجة)',
      phone: '01198765432',
      relation: 'زوجة'
    },
    medicalConditions: ['سكري من النوع الثاني متحكم به'],
    allergies: [],
    insurance: {
      provider: 'لا يوجد تأمين نقدي',
      policyNumber: '',
      discountPercent: 0
    },
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    isActive: true,
    totalSpent: 12000,
    outstandingBalance: 4000,
    lastVisit: '2026-06-25',
    createdAt: '2026-04-10T11:30:00.000Z'
  },
  {
    id: 'PAT-119402',
    name: 'مازن يوسف كمال',
    phone: '01234511223',
    email: 'mazen@example.com',
    password: '123',
    bloodType: 'B-',
    emergencyContact: {
      name: 'كمال يوسف (الأب)',
      phone: '01234511220',
      relation: 'أب'
    },
    medicalConditions: [],
    allergies: ['الغبار'],
    insurance: {
      provider: 'أكسا للرعاية الطبية',
      policyNumber: 'AXA-DENT-8840',
      discountPercent: 20
    },
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150&h=150',
    isActive: true,
    totalSpent: 0,
    outstandingBalance: 0,
    lastVisit: '2026-06-28',
    createdAt: '2026-06-28T09:00:00.000Z'
  }
];

const initialInventorySeed: InventoryItem[] = [
  {
    id: 'INV-SKU-001',
    name: 'مخدر موضعي أرتيكائين 4%',
    category: 'مستهلكات عيادة تخدير',
    sku: 'ART-4%-001',
    quantity: 120,
    supplier: 'الشركة المتحدة للمستلزمات الطبية',
    unitPrice: 15,
    minQuantity: 30,
    expirationDate: '2027-12-01',
    storageLocation: 'درج الحفظ أ-2',
    status: 'In Stock',
    createdAt: '2026-06-01T08:00:00.000Z'
  },
  {
    id: 'INV-SKU-002',
    name: 'شفرات حشو عصب روتاري 25مم',
    category: 'أدوات حشو عصب دورة',
    sku: 'ROT-FILE-25',
    quantity: 12,
    supplier: 'شركة دلتا لطب الأسنان',
    unitPrice: 85,
    minQuantity: 15,
    expirationDate: '2028-05-15',
    storageLocation: 'رف التعقيم ب-1',
    status: 'Low Stock',
    createdAt: '2026-06-02T10:15:00.000Z'
  },
  {
    id: 'INV-SKU-003',
    name: 'زرعات تيتانيوم ألمانية 4.5مم',
    category: 'مستلزمات زراعة دقيقة',
    sku: 'GER-IMP-4.5',
    quantity: 0,
    supplier: 'بريميم جيرمان دنت',
    unitPrice: 2200,
    minQuantity: 5,
    expirationDate: '2030-01-01',
    storageLocation: 'خزنة الزرعات المعقمة د-4',
    status: 'Out of Stock',
    createdAt: '2026-06-05T12:00:00.000Z'
  }
];

const initialExpensesSeed: Expense[] = [
  {
    id: 'EXP-1001',
    category: 'Supplies',
    description: 'شراء كبسولات أميلوجين وحشوات ضوئية تجميلية بيلاروسيا',
    amount: 1500,
    supplier: 'شركة مكة للمستلزمات',
    date: '2026-06-10',
    createdAt: '2026-06-10T14:00:00.000Z'
  },
  {
    id: 'EXP-1002',
    category: 'Rent',
    description: 'إيجار مقر عيادة برج فريدة ميت غمر لشهر يونيو',
    amount: 3000,
    supplier: 'الحاج فريد الجوهري',
    date: '2026-06-01',
    createdAt: '2026-06-01T09:00:00.000Z'
  },
  {
    id: 'EXP-1003',
    category: 'Utilities',
    description: 'فاتورة الكهرباء والإنترنت والتعقيم لشهر مايو',
    amount: 800,
    supplier: 'مرافق شرق الدقهلية',
    date: '2026-06-05',
    createdAt: '2026-06-05T11:00:00.000Z'
  }
];

const initialAppointmentsSeed: AdminAppointment[] = [
  {
    id: 'APP-1001',
    patientId: 'PAT-829402',
    patientName: 'سارة عبد الرحمن منصور',
    patientPhone: '01039591109',
    doctorEmail: 'amr.eladawy@gmail.com',
    doctorName: 'Dr. Amr El-Adawy',
    date: '2026-06-20',
    time: '15:30',
    duration: 30,
    visitType: 'Treatment',
    chairId: 'Chair 1',
    consultationFee: 200,
    paymentMethod: 'Cash',
    status: 'Completed',
    notes: 'جلسة تنظيف الجير الدورية وتلميع الأسنان',
    createdAt: '2026-06-18T10:00:00.000Z'
  },
  {
    id: 'APP-1002',
    patientId: 'PAT-402941',
    patientName: 'محمد علي البدري',
    patientPhone: '01124567890',
    doctorEmail: 'basel.elmorsy@gmail.com',
    doctorName: 'Dr. Basel El-Morsy',
    date: '2026-06-25',
    time: '18:00',
    duration: 60,
    visitType: 'Treatment',
    chairId: 'Chair 2',
    consultationFee: 200,
    paymentMethod: 'Card',
    status: 'Completed',
    notes: 'تحضير للتاج الزيركون النهائي للسن',
    createdAt: '2026-06-22T14:30:00.000Z'
  },
  {
    id: 'APP-1003',
    patientId: 'PAT-119402',
    patientName: 'مازن يوسف كمال',
    patientPhone: '01234511223',
    doctorEmail: 'amr.eladawy@gmail.com',
    doctorName: 'Dr. Amr El-Adawy',
    date: '2026-06-29',
    time: '14:00',
    duration: 45,
    visitType: 'Consultation',
    chairId: 'Chair 1',
    consultationFee: 250,
    paymentMethod: 'InstaPay',
    status: 'Confirmed',
    notes: 'كشف واستشارة زراعة أسنان رقمية',
    createdAt: '2026-06-28T09:15:00.000Z'
  }
];

const initialTreatmentsSeed: TreatmentPlan[] = [
  {
    id: 'TRT-1001',
    patientId: 'PAT-829402',
    title: 'حشوات ضوئية تجميلية للضروس الخلفية السفلى',
    description: 'إزالة التسوس المتعمق في الضروس رقم 19 و 20 وبناء حشو كومبوزيت تجميلي',
    status: 'In Progress',
    totalCost: 1500,
    paidAmount: 500,
    createdAt: '2026-06-15T11:00:00.000Z',
    sessions: [
      {
        id: 'SES-001',
        date: '2026-06-15',
        notes: 'تم إزالة تسوس الضرس رقم 19 ووضع قاعدة حشو مهدئة',
        completed: true,
        affectedTeeth: [19],
        toothCondition: 'Filling'
      },
      {
        id: 'SES-002',
        date: '2026-06-22',
        notes: 'حشو نهائي للضرس 19 وجار فحص الضرس 20 الجلسة القادمة',
        completed: false,
        affectedTeeth: [20],
        toothCondition: 'Cavity'
      }
    ]
  },
  {
    id: 'TRT-1002',
    patientId: 'PAT-402941',
    title: 'علاج عصب فوري للضرس رقم 14 وتاج زيركون صلب',
    description: 'تنظيف ميكروسكوبي لقنوات العصب في الضرس 14 وتثبيت تاج زيركون ألماني تجميلي',
    status: 'Completed',
    totalCost: 6500,
    paidAmount: 6500,
    createdAt: '2026-06-10T09:30:00.000Z',
    sessions: [
      {
        id: 'SES-101',
        date: '2026-06-10',
        notes: 'جلسة واحدة تنظيف روتاري دوار وحشو عصب ثلاثي الأبعاد ممتاز',
        completed: true,
        affectedTeeth: [14],
        toothCondition: 'Root Canal'
      },
      {
        id: 'SES-102',
        date: '2026-06-25',
        notes: 'برد السن وتجربة القياس وتلبيس التاج الزيركون النهائي بنجاح تجميلي كامل',
        completed: true,
        affectedTeeth: [14],
        toothCondition: 'Crown'
      }
    ]
  }
];

const initialInvoicesSeed: Invoice[] = [
  {
    id: 'INV-2026-0001',
    patientId: 'PAT-829402',
    appointmentId: 'APP-1001',
    date: '2026-06-20',
    dueDate: '2026-06-27',
    items: [
      { id: 'ITM-01', description: 'جلسة تنظيف جير تجميلي تلميع', quantity: 1, unitPrice: 1000 },
      { id: 'ITM-02', description: 'حشوة تجميلية أولية', quantity: 1, unitPrice: 1000 }
    ],
    discount: 200, // EGP
    tax: 14, // 14%
    status: 'Paid',
    payments: [
      { id: 'PAY-2001', date: '2026-06-20', amount: 2052, method: 'Cash', notes: 'سداد نقدي في الاستقبال' }
    ],
    totalAmount: 2052, // (2000 - 200) * 1.14 = 1800 * 1.14 = 2052
    paidAmount: 2052,
    createdAt: '2026-06-20T16:00:00.000Z'
  },
  {
    id: 'INV-2026-0002',
    patientId: 'PAT-402941',
    treatmentPlanId: 'TRT-1002',
    date: '2026-06-25',
    dueDate: '2026-07-02',
    items: [
      { id: 'ITM-03', description: 'خطة علاج عصب الضرس 14 بالروتاري', quantity: 1, unitPrice: 3500 },
      { id: 'ITM-04', description: 'تاج زيركون ألماني تجميلي مسبق الصنع', quantity: 1, unitPrice: 3000 }
    ],
    discount: 500,
    tax: 0, // 0%
    status: 'Paid',
    payments: [
      { id: 'PAY-2002', date: '2026-06-25', amount: 6000, method: 'Card', notes: 'جهاز الدفع في العيادة' }
    ],
    totalAmount: 6000, // 6500 - 500 = 6000
    paidAmount: 6000,
    createdAt: '2026-06-25T19:00:00.000Z'
  }
];

const initialNotificationsSeed: ClinicNotification[] = [
  {
    id: 'NOT-001',
    type: 'Inventory',
    priority: 'High',
    title: 'نفاد مخزون الزرعات التيتانيوم',
    message: 'زرعات تيتانيوم ألمانية 4.5مم وصلت للصفر بالكامل في المخزن الرئيسي. يرجى إعادة الطلب.',
    read: false,
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
  },
  {
    id: 'NOT-002',
    type: 'Appointments',
    priority: 'Medium',
    title: 'تأكيد حجز جديد مازن كمال',
    message: 'قام المريض مازن يوسف بحجز كشف استشارة جديد بتاريخ اليوم الساعة 14:00 مع د. عمرو العدوي.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    patientId: 'PAT-119402'
  }
];

// Local Cache variable
let dbCache: Record<string, any> = {};
let isDbLoadedState = false;
let isLoadedFromBackend = false;

// Token auto-refresh helper
async function attemptTokenRefresh(): Promise<boolean> {
  try {
    const body: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const rToken = window.sessionStorage.getItem("azure_refresh_token") || window.localStorage.getItem("azure_refresh_token");
      if (rToken) {
        body["refreshToken"] = rToken;
      }
    }
    const res = await fetch("/api/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body)
    });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined" && data.token) {
        window.sessionStorage.setItem("azure_access_token", data.token);
        window.localStorage.setItem("azure_access_token", data.token);
      }
      if (typeof window !== "undefined" && data.refreshToken) {
        window.sessionStorage.setItem("azure_refresh_token", data.refreshToken);
        window.localStorage.setItem("azure_refresh_token", data.refreshToken);
      }
      return true;
    }
  } catch (e) {
    console.error("Failed to automatically refresh access token:", e);
  }
  return false;
}

// Async synchronization helper with JWT access tokens and error retry
async function syncWithBackend(key: string, data: any) {
  if (typeof window !== "undefined") {
    const isAuth = window.sessionStorage.getItem("azure_admin_authenticated") === "true";
    const role = window.sessionStorage.getItem("azure_user_role");
    const isStaffOrAdmin = isAuth && role && role !== "PATIENT";
    
    if (!isStaffOrAdmin) {
      console.log(`Skipping sync of '${key}' to backend since user is not authenticated as staff/admin.`);
      return;
    }
  }

  try {
    const endpoint = `/api/${key.replace("_", "-")}`;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (typeof window !== "undefined") {
      const token = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let res = await fetch(endpoint, {
      method: "POST",
      headers,
      credentials: "include",
      body: JSON.stringify(data)
    });

    if (res.status === 401) {
      // Access token expired, attempt automatic background refresh
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        const freshHeaders: Record<string, string> = { "Content-Type": "application/json" };
        if (typeof window !== "undefined") {
          const freshToken = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
          if (freshToken) {
            freshHeaders["Authorization"] = `Bearer ${freshToken}`;
          }
        }
        res = await fetch(endpoint, {
          method: "POST",
          headers: freshHeaders,
          credentials: "include",
          body: JSON.stringify(data)
        });
      }
    }

    if (!res.ok) {
      console.error(`Backend save returned non-OK code for key ${key} at ${endpoint}:`, res.status);
    }
  } catch (err) {
    console.error(`Failed to sync key ${key} with full-stack backend:`, err);
  }
}

// Ensure every treatment plan has a matching invoice and correct payments
export function reconcileInvoicesAndTreatments() {
  const allInvoices = dbCache.invoices || [];
  const allTreatments = dbCache.treatments || [];
  let invoiceListUpdated = false;

  allTreatments.forEach((plan: any) => {
    const hasInvoice = allInvoices.some((inv: any) => inv.treatmentPlanId === plan.id);
    if (!hasInvoice) {
      const invNumber = `INV-2026-TRT-${plan.id.slice(-6)}`;
      const planDate = plan.createdAt ? plan.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
      
      const invoicePayments = [];
      if (Number(plan.paidAmount) > 0) {
        invoicePayments.push({
          id: 'PAY-trt-' + plan.id,
          date: planDate,
          amount: Number(plan.paidAmount),
          method: 'Cash' as const,
          notes: `دفعة مقدمة مستوردة لخطة العلاج: ${plan.title}`
        });
      }

      const newInvoice = {
        id: invNumber,
        patientId: plan.patientId,
        treatmentPlanId: plan.id,
        date: planDate,
        dueDate: planDate,
        items: [
          {
            id: 'ITM-trt-' + plan.id,
            description: `خطة علاج: ${plan.title}`,
            quantity: 1,
            unitPrice: Number(plan.totalCost)
          }
        ],
        discount: 0,
        tax: 0,
        status: (Number(plan.paidAmount) >= Number(plan.totalCost) ? 'Paid' : (Number(plan.paidAmount) > 0 ? 'Partially Paid' : 'Sent')) as any,
        payments: invoicePayments,
        totalAmount: Number(plan.totalCost),
        paidAmount: Number(plan.paidAmount),
        createdAt: plan.createdAt || new Date().toISOString()
      };
      
      allInvoices.unshift(newInvoice);
      invoiceListUpdated = true;
    } else {
      const invoice = allInvoices.find((inv: any) => inv.treatmentPlanId === plan.id);
      if (invoice) {
        const paymentsSum = (invoice.payments || []).reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0);
        if (paymentsSum !== Number(plan.paidAmount)) {
          const planDate = plan.createdAt ? plan.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10);
          if (!invoice.payments) invoice.payments = [];
          
          if (Number(plan.paidAmount) === 0) {
            invoice.payments = [];
          } else {
            invoice.payments = [
              {
                id: 'PAY-sync-' + plan.id,
                date: planDate,
                amount: Number(plan.paidAmount),
                method: 'Cash' as const,
                notes: `دفعة خطة علاج (محدثة تلقائياً): ${plan.title}`
              }
            ];
          }
          invoice.paidAmount = Number(plan.paidAmount);
          invoice.status = (Number(plan.paidAmount) >= Number(invoice.totalAmount) ? 'Paid' : (Number(plan.paidAmount) > 0 ? 'Partially Paid' : 'Sent')) as any;
          invoiceListUpdated = true;
        }
      }
    }
  });

  if (invoiceListUpdated) {
    dbCache.invoices = allInvoices;
    if (!isLoadedFromBackend) {
      localStorage.setItem(KEYS.INVOICES, JSON.stringify(allInvoices));
    } else {
      syncWithBackend('invoices', allInvoices);
    }
  }
}

// Initialize Database Function
export async function initClinicDb(force: boolean = false): Promise<void> {
  if (isDbLoadedState && isLoadedFromBackend && !force) return;

  // Check if we are authenticated on the backend first
  let authenticated = false;
  let userRole = "";
  try {
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }
    const meRes = await fetch("/api/auth/me", { headers, credentials: "include" });
    if (meRes.ok) {
      const meData = await meRes.json();
      authenticated = true;
      userRole = meData?.user?.role || "";
    }
  } catch (err) {
    console.warn("Pre-init auth check failed:", err);
  }

  if (authenticated) {
    const fetchSafe = async (url: string, fallback: any = []) => {
      try {
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
          const token = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
          if (token) {
            headers["Authorization"] = `Bearer ${token}`;
          }
        }
        let res = await fetch(url, { headers, credentials: "include" });
        if (res.status === 401) {
          const refreshed = await attemptTokenRefresh();
          if (refreshed) {
            const freshHeaders: Record<string, string> = {};
            if (typeof window !== "undefined") {
              const freshToken = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
              if (freshToken) {
                freshHeaders["Authorization"] = `Bearer ${freshToken}`;
              }
            }
            res = await fetch(url, { headers: freshHeaders, credentials: "include" });
          }
        }
        if (res.ok) {
          return await res.json();
        }
        console.warn(`Fetch to ${url} returned status ${res.status}`);
        return fallback;
      } catch (err) {
        console.warn(`Fetch to ${url} failed:`, err);
        return fallback;
      }
    };

    try {
      const isStaffOrAdmin = userRole && userRole !== "PATIENT";

      const [
        doctors,
        patients,
        appointments,
        dental_charts,
        treatments,
        invoices,
        expenses,
        inventory,
        notifications,
        settlements,
        profit_transactions,
        month_locks,
        revenue_share_rules
      ] = await Promise.all([
        fetchSafe("/api/doctors", SEED_DOCTORS),
        fetchSafe("/api/patients"),
        fetchSafe("/api/appointments"),
        fetchSafe("/api/dental-charts", {}),
        fetchSafe("/api/treatments"),
        fetchSafe("/api/invoices"),
        isStaffOrAdmin ? fetchSafe("/api/expenses") : Promise.resolve([]),
        isStaffOrAdmin ? fetchSafe("/api/inventory") : Promise.resolve([]),
        fetchSafe("/api/notifications"),
        isStaffOrAdmin ? fetchSafe("/api/settlements") : Promise.resolve([]),
        isStaffOrAdmin ? fetchSafe("/api/profit-transactions") : Promise.resolve([]),
        fetchSafe("/api/month-locks"),
        isStaffOrAdmin ? fetchSafe("/api/revenue-share-rules") : Promise.resolve([])
      ]);

      dbCache = {
        doctors,
        patients,
        appointments,
        dental_charts,
        treatments,
        invoices,
        expenses,
        inventory,
        notifications,
        settlements,
        profit_transactions,
        month_locks,
        revenue_share_rules
      };
      isDbLoadedState = true;
      isLoadedFromBackend = true;
      reconcileInvoicesAndTreatments();
      recalculatePatientBalances();
      console.log("Database cache successfully loaded from Prisma REST API endpoints!");
      return;
    } catch (err) {
      console.warn("Failed to connect to backend REST API, using local storage cache as fallback:", err);
    }
  }

  // Local storage fallback for reliability (e.g. static rendering, compile checks, unauthenticated guest view)
  const keysArray = [
    { key: 'doctors', seed: SEED_DOCTORS, storageKey: KEYS.DOCTORS },
    { key: 'patients', seed: initialPatientsSeed, storageKey: KEYS.PATIENTS },
    { key: 'inventory', seed: initialInventorySeed, storageKey: KEYS.INVENTORY },
    { key: 'expenses', seed: initialExpensesSeed, storageKey: KEYS.EXPENSES },
    { key: 'appointments', seed: initialAppointmentsSeed, storageKey: KEYS.APPOINTMENTS },
    { key: 'treatments', seed: initialTreatmentsSeed, storageKey: KEYS.TREATMENTS },
    { key: 'invoices', seed: initialInvoicesSeed, storageKey: KEYS.INVOICES },
    { key: 'notifications', seed: initialNotificationsSeed, storageKey: KEYS.NOTIFICATIONS },
    { key: 'settlements', seed: [], storageKey: KEYS.SETTLEMENTS },
    { key: 'profit_transactions', seed: [], storageKey: KEYS.PROFIT_TRANSACTIONS },
    { key: 'month_locks', seed: [], storageKey: KEYS.MONTH_LOCKS }
  ];

  dbCache = {};
  keysArray.forEach(item => {
    const local = localStorage.getItem(item.storageKey);
    dbCache[item.key] = local ? JSON.parse(local) : item.seed;
    if (!local) {
      localStorage.setItem(item.storageKey, JSON.stringify(item.seed));
    }
  });

  const localCharts = localStorage.getItem(KEYS.DENTAL_CHARTS);
  dbCache.dental_charts = localCharts ? JSON.parse(localCharts) : {};
  
  initialPatientsSeed.forEach(p => {
    if (!dbCache.dental_charts[p.id]) {
      dbCache.dental_charts[p.id] = generateDefaultChart(p.id, false);
    }
  });

  localStorage.setItem(KEYS.DENTAL_CHARTS, JSON.stringify(dbCache.dental_charts));
  isDbLoadedState = true;
  reconcileInvoicesAndTreatments();
  recalculatePatientBalances();
}

export function isDbLoaded(): boolean {
  return isDbLoadedState;
}

// Collection Getters
export function getDoctors(): AdminDoctor[] {
  return dbCache.doctors || SEED_DOCTORS;
}

export function getPatients(): ExtendedPatient[] {
  return dbCache.patients || [];
}

export function getAppointments(): AdminAppointment[] {
  return dbCache.appointments || [];
}

export function getDentalCharts(): Record<string, DentalChart> {
  return dbCache.dental_charts || {};
}

export function getPatientChart(patientId: string, isChild: boolean = false): DentalChart {
  const charts = getDentalCharts();
  if (!charts[patientId]) {
    const newChart = generateDefaultChart(patientId, isChild);
    charts[patientId] = newChart;
    saveDentalCharts(charts);
    return newChart;
  }
  return charts[patientId];
}

export function getTreatments(): TreatmentPlan[] {
  return dbCache.treatments || [];
}

export function getInvoices(): Invoice[] {
  return dbCache.invoices || [];
}

export function getExpenses(): Expense[] {
  return dbCache.expenses || [];
}

export function getInventory(): InventoryItem[] {
  return dbCache.inventory || [];
}

export function getNotifications(): ClinicNotification[] {
  return dbCache.notifications || [];
}

export function getSettlements(): MonthlyProfitReport[] {
  return dbCache.settlements || [];
}

export function getProfitTransactions(): ProfitTransaction[] {
  return dbCache.profit_transactions || [];
}

export function getMonthLocks(): string[] {
  return dbCache.month_locks || [];
}

// Add/Update Operations

export function saveDoctors(doctors: AdminDoctor[]) {
  dbCache.doctors = doctors;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.DOCTORS, JSON.stringify(doctors));
  }
  syncWithBackend('doctors', doctors);
}

export function savePatients(patients: ExtendedPatient[]) {
  dbCache.patients = patients;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(patients));
  }
  syncWithBackend('patients', patients);
}

export function saveAppointments(appointments: AdminAppointment[]) {
  dbCache.appointments = appointments;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }
  syncWithBackend('appointments', appointments);
}

export function saveDentalCharts(charts: Record<string, DentalChart>) {
  dbCache.dental_charts = charts;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.DENTAL_CHARTS, JSON.stringify(charts));
  }
  syncWithBackend('dental_charts', charts);
}

export function saveTreatments(treatments: TreatmentPlan[]) {
  dbCache.treatments = treatments;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.TREATMENTS, JSON.stringify(treatments));
  }
  syncWithBackend('treatments', treatments);
}

export function saveInvoices(invoices: Invoice[]) {
  dbCache.invoices = invoices;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(invoices));
  }
  syncWithBackend('invoices', invoices);
}

export function saveExpenses(expenses: Expense[]) {
  dbCache.expenses = expenses;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(expenses));
  }
  syncWithBackend('expenses', expenses);
}

export function saveInventory(inventory: InventoryItem[]) {
  dbCache.inventory = inventory;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(inventory));
  }
  syncWithBackend('inventory', inventory);
}

export function saveNotifications(notifications: ClinicNotification[]) {
  dbCache.notifications = notifications;
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }
  syncWithBackend('notifications', notifications);
}

export function saveSettlement(settlement: MonthlyProfitReport) {
  if (!dbCache.settlements) {
    dbCache.settlements = [];
  }
  const index = dbCache.settlements.findIndex((s: any) => s.month === settlement.month);
  if (index > -1) {
    dbCache.settlements[index] = settlement;
  } else {
    dbCache.settlements.push(settlement);
  }
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.SETTLEMENTS, JSON.stringify(dbCache.settlements));
  }
  // This sends individual settlement payload to server.ts post route
  syncWithBackend('settlements', settlement);
}

export async function saveMonthLock(month: string, action: 'lock' | 'unlock') {
  if (!dbCache.month_locks) {
    dbCache.month_locks = [];
  }
  if (action === 'lock') {
    if (!dbCache.month_locks.includes(month)) {
      dbCache.month_locks.push(month);
    }
  } else {
    dbCache.month_locks = dbCache.month_locks.filter(m => m !== month);
  }
  
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.MONTH_LOCKS, JSON.stringify(dbCache.month_locks));
  } else {
    try {
      let res = await fetch("/api/month-locks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ month, action })
      });
      if (res.status === 401) {
        const refreshed = await attemptTokenRefresh();
        if (refreshed) {
          res = await fetch("/api/month-locks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ month, action })
          });
        }
      }
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update month lock on backend");
      }
    } catch (err) {
      console.error("Failed to save month lock to backend:", err);
      throw err;
    }
  }
}

// Balance calculations & rollback
export function recalculatePatientBalances() {
  const patients = getPatients();
  const invoices = getInvoices();
  const treatments = getTreatments();
  const appointments = getAppointments();

  const updatedPatients = patients.map(p => {
    // Total Spent = Sum of paid invoices + paid treatments + completed appts consultation fees paid
    // Active / Outstanding balance = Unpaid invoices + Unpaid treatments + Completed unconfirmed consultations fee unpaid
    
    // 1. Invoices Calculations
    const patInvoices = invoices.filter(inv => inv.patientId === p.id && inv.status !== 'Cancelled');
    const invoiceTotalPaid = patInvoices.reduce((sum, inv) => sum + inv.paidAmount, 0);
    const invoiceTotalGross = patInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const invoiceOutstanding = invoiceTotalGross - invoiceTotalPaid;

    // 2. Treatments Calculations (only count treatments not covered by invoices to prevent double counting, 
    // or just assume treatment outstanding/spending is counted directly if not invoiced. To be simple and robust:
    // we count treatment plans directly, and exclude their cost if they are invoiced).
    const patTreatments = treatments.filter(t => t.patientId === p.id && t.status !== 'Cancelled');
    const invoicePlanIds = patInvoices.map(inv => inv.treatmentPlanId).filter(Boolean);
    
    // Filter out treatments that are already invoiced to avoid double counting
    const directTreatments = patTreatments.filter(t => !invoicePlanIds.includes(t.id));
    const treatmentTotalPaid = directTreatments.reduce((sum, t) => sum + t.paidAmount, 0);
    const directTreatmentOutstanding = directTreatments.reduce((sum, t) => sum + Math.max(0, t.totalCost - t.paidAmount), 0);

    // 3. Consultation Fees (from completed appointments)
    const patAppts = appointments.filter(app => app.patientId === p.id && app.status === 'Completed');
    const invoiceApptIds = patInvoices.map(inv => inv.appointmentId).filter(Boolean);
    const directAppts = patAppts.filter(app => !invoiceApptIds.includes(app.id));
    const consultationsPaid = directAppts.reduce((sum, app) => sum + app.consultationFee, 0); // assume completed direct appts are paid
    
    const totalSpent = invoiceTotalPaid + treatmentTotalPaid + consultationsPaid;
    const outstandingBalance = invoiceOutstanding + directTreatmentOutstanding;

    // Last visit
    const visits = appointments
      .filter(app => app.patientId === p.id && (app.status === 'Completed' || app.status === 'Confirmed'))
      .map(app => app.date)
      .sort();
    const lastVisit = visits.length > 0 ? visits[visits.length - 1] : p.lastVisit;

    return {
      ...p,
      totalSpent,
      outstandingBalance: outstandingBalance < 0 ? 0 : outstandingBalance,
      lastVisit
    };
  });

  savePatients(updatedPatients);
}

// Create a trigger for notification
export function addNotification(
  type: 'Appointments' | 'Payments' | 'Inventory' | 'Patients' | 'Treatments' | 'System',
  priority: 'Low' | 'Medium' | 'High',
  title: string,
  message: string,
  patientId?: string,
  actionUrl?: string
) {
  const notifications = getNotifications();
  const newNot: ClinicNotification = {
    id: 'NOT-' + Math.floor(100000 + Math.random() * 900000).toString(),
    type,
    priority,
    title,
    message,
    read: false,
    createdAt: new Date().toISOString(),
    patientId,
    actionUrl
  };
  notifications.unshift(newNot);
  saveNotifications(notifications);
}

// Dental Chart Sync Helper: Complete a Treatment Session
export function completeTreatmentSession(treatmentPlanId: string, sessionId: string, patientId: string) {
  const treatments = getTreatments();
  const charts = getDentalCharts();
  const patientChart = charts[patientId] || generateDefaultChart(patientId, false);

  const updatedTreatments = treatments.map(plan => {
    if (plan.id === treatmentPlanId) {
      const updatedSessions = plan.sessions.map(sess => {
        if (sess.id === sessionId) {
          const wasCompleted = sess.completed;
          if (!wasCompleted) {
            // Update Tooth Statuses on Dental Chart
            sess.affectedTeeth.forEach(toothNum => {
              if (patientChart.teeth[toothNum]) {
                patientChart.teeth[toothNum].condition = sess.toothCondition;
                patientChart.teeth[toothNum].treatmentDate = new Date().toISOString().slice(0, 10);
                patientChart.teeth[toothNum].notes = sess.notes;
              }
            });
            
            // Add progress notification
            addNotification(
              'Treatments',
              'Medium',
              `جلسة علاج مكتملة`,
              `تم إكمال جلسة علاج في خطة "${plan.title}" للمريض ${patientId}.`,
              patientId
            );
          }
          return { ...sess, completed: true };
        }
        return sess;
      });

      // Check if all sessions are completed
      const allCompleted = updatedSessions.every(s => s.completed);
      return {
        ...plan,
        sessions: updatedSessions,
        status: allCompleted ? 'Completed' as const : 'In Progress' as const
      };
    }
    return plan;
  });

  saveTreatments(updatedTreatments);
  charts[patientId] = patientChart;
  saveDentalCharts(charts);
  recalculatePatientBalances();
}

// Automatic inventory tracking check
export function checkInventoryStockAlerts() {
  const inventory = getInventory();
  inventory.forEach(item => {
    let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
    if (item.quantity === 0) {
      status = 'Out of Stock';
      // Trigger High notification if not already triggered
      const nots = getNotifications();
      const alreadyNotified = nots.some(n => n.type === 'Inventory' && n.message.includes(item.name) && n.priority === 'High' && !n.read);
      if (!alreadyNotified) {
        addNotification(
          'Inventory',
          'High',
          `نفاد مخزون: ${item.name}`,
          `المستلزم الطبي "${item.name}" (SKU: ${item.sku}) قد نفد بالكامل من العيادة.`
        );
      }
    } else if (item.quantity <= item.minQuantity) {
      status = 'Low Stock';
      const nots = getNotifications();
      const alreadyNotified = nots.some(n => n.type === 'Inventory' && n.message.includes(item.name) && n.priority === 'Medium' && !n.read);
      if (!alreadyNotified) {
        addNotification(
          'Inventory',
          'Medium',
          `انخفاض مخزون: ${item.name}`,
          `كمية "${item.name}" منخفضة (${item.quantity} متبقي). الكمية الحرجة الأدنى هي ${item.minQuantity}.`
        );
      }
    }
    item.status = status;
  });
  saveInventory(inventory);
}

// 8. Profit Sharing Engine
export interface PeriodFilter {
  type: 'month' | 'year' | 'range' | 'all';
  month?: string; // YYYY-MM
  year?: string;  // YYYY
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export function isDateInPeriod(dateStr: string, filter: PeriodFilter): boolean {
  if (!dateStr) return false;
  const date = dateStr.slice(0, 10); // YYYY-MM-DD
  if (filter.type === 'all') return true;
  if (filter.type === 'month' && filter.month) {
    return date.startsWith(filter.month);
  }
  if (filter.type === 'year' && filter.year) {
    return date.startsWith(filter.year);
  }
  if (filter.type === 'range' && filter.startDate && filter.endDate) {
    return date >= filter.startDate && date <= filter.endDate;
  }
  return false;
}

export function calculateProfitSharingReport(filter: PeriodFilter): MonthlyProfitReport {
  if (filter.type === 'month' && filter.month) {
    const isLocked = (getMonthLocks() || []).includes(filter.month);
    const saved = getSettlements().find(s => s.month === filter.month);
    if (saved && (saved.isLocked || isLocked)) {
      return saved;
    }
  }

  const appointments = getAppointments();
  const treatments = getTreatments();
  const invoices = getInvoices();
  const expenses = getExpenses();

  let monthLabel = "كل الأوقات";
  if (filter.type === 'month' && filter.month) {
    monthLabel = filter.month;
  } else if (filter.type === 'year' && filter.year) {
    monthLabel = `عام ${filter.year}`;
  } else if (filter.type === 'range' && filter.startDate && filter.endDate) {
    monthLabel = `${filter.startDate} إلى ${filter.endDate}`;
  }

  const report: MonthlyProfitReport = {
    month: monthLabel,
    totalRevenue: 0,
    totalExpenses: 0,
    totalNetProfit: 0,
    unpaidInvoicesSum: 0,
    unpaidTreatmentsSum: 0,
    unpaidConsultationsSum: 0,
    distributions: {
      'amr.eladawy@gmail.com': {
        doctorEmail: 'amr.eladawy@gmail.com',
        doctorName: 'Dr. Amr El-Adawy',
        appointmentRevenue: 0,
        treatmentRevenue: 0,
        manualInvoiceRevenue: 0,
        totalGrossRevenue: 0,
        shareOfExpenses: 0,
        netProfit: 0
      },
      'basel.elmorsy@gmail.com': {
        doctorEmail: 'basel.elmorsy@gmail.com',
        doctorName: 'Dr. Basel El-Morsy',
        appointmentRevenue: 0,
        treatmentRevenue: 0,
        manualInvoiceRevenue: 0,
        totalGrossRevenue: 0,
        shareOfExpenses: 0,
        netProfit: 0
      }
    }
  };

  // Filter expenses of the selected period
  const periodExpenses = expenses.filter(exp => isDateInPeriod(exp.date, filter));
  const totalExpenses = periodExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  report.totalExpenses = totalExpenses;

  // Deduct expenses equally (50% / 50%)
  const shareOfExpensePerDoctor = totalExpenses / 2;
  report.distributions['amr.eladawy@gmail.com'].shareOfExpenses = shareOfExpensePerDoctor;
  report.distributions['basel.elmorsy@gmail.com'].shareOfExpenses = shareOfExpensePerDoctor;

  const getRuleForEmail = (email: string, dateStr: string) => {
    const doc = (getDoctors() || []).find((d: any) => d.email === email);
    if (!doc) return { selfPct: 65, partnerPct: 35 };

    const rules = dbCache.revenue_share_rules || [];
    const rule = rules.find((r: any) => {
      if (r.doctorId !== doc.id) return false;
      const date = dateStr.slice(0, 10);
      return r.effectiveFrom <= date && (!r.effectiveTo || r.effectiveTo >= date);
    });

    if (rule) {
      return { selfPct: Number(rule.selfSharePct), partnerPct: Number(rule.partnerSharePct) };
    }
    return { selfPct: 65, partnerPct: 35 };
  };

  // 1. Direct Completed Appointments Revenue (those without invoices are assumed paid on completion)
  const completedApptsWithoutInvoice = appointments.filter(app => 
    isDateInPeriod(app.date, filter) && 
    app.status === 'Completed' && 
    !invoices.some(inv => inv.appointmentId === app.id)
  );

  completedApptsWithoutInvoice.forEach(appt => {
    const fee = appt.consultationFee;
    report.totalRevenue += fee;

    const email = appt.doctorEmail;
    const partnerEmail = email === 'amr.eladawy@gmail.com' ? 'basel.elmorsy@gmail.com' : 'amr.eladawy@gmail.com';

    const { selfPct, partnerPct } = getRuleForEmail(email, appt.date);

    if (email === 'amr.eladawy@gmail.com' || email === 'basel.elmorsy@gmail.com') {
      report.distributions[email].appointmentRevenue += fee * (selfPct / 100);
      report.distributions[partnerEmail].appointmentRevenue += fee * (partnerPct / 100);
    } else {
      // fallback splits equally
      report.distributions['amr.eladawy@gmail.com'].appointmentRevenue += fee * ((partnerPct / 2) / 100);
      report.distributions['basel.elmorsy@gmail.com'].appointmentRevenue += fee * ((partnerPct / 2) / 100);
    }
  });

  // 2. Invoice Payments Revenue
  invoices.forEach(inv => {
    if (inv.status === 'Cancelled') return;

    // Look up paid amount in the period
    const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
    const paidInPeriod = periodPayments.reduce((sum, p) => sum + p.amount, 0);

    if (paidInPeriod === 0) return;

    report.totalRevenue += paidInPeriod;

    if (inv.treatmentPlanId) {
      // Find treatment doctor
      const patientAppointments = appointments.filter(app => app.patientId === inv.patientId);
      const latestApp = patientAppointments.length > 0 ? patientAppointments[0] : null;
      const docEmail = latestApp ? latestApp.doctorEmail : 'amr.eladawy@gmail.com';
      const partnerEmail = docEmail === 'amr.eladawy@gmail.com' ? 'basel.elmorsy@gmail.com' : 'amr.eladawy@gmail.com';

      const { selfPct, partnerPct } = getRuleForEmail(docEmail, inv.date);

      if (docEmail === 'amr.eladawy@gmail.com' || docEmail === 'basel.elmorsy@gmail.com') {
        report.distributions[docEmail].treatmentRevenue += paidInPeriod * (selfPct / 100);
        report.distributions[partnerEmail].treatmentRevenue += paidInPeriod * (partnerPct / 100);
      } else {
        report.distributions['amr.eladawy@gmail.com'].treatmentRevenue += paidInPeriod * ((partnerPct / 2) / 100);
        report.distributions['basel.elmorsy@gmail.com'].treatmentRevenue += paidInPeriod * ((partnerPct / 2) / 100);
      }
    } else if (inv.appointmentId) {
      const appt = appointments.find(a => a.id === inv.appointmentId);
      // ONLY count if the appointment is Completed
      if (appt && appt.status === 'Completed') {
        const docEmail = appt.doctorEmail || 'amr.eladawy@gmail.com';
        const partnerEmail = docEmail === 'amr.eladawy@gmail.com' ? 'basel.elmorsy@gmail.com' : 'amr.eladawy@gmail.com';

        const { selfPct, partnerPct } = getRuleForEmail(docEmail, inv.date);

        if (docEmail === 'amr.eladawy@gmail.com' || docEmail === 'basel.elmorsy@gmail.com') {
          report.distributions[docEmail].appointmentRevenue += paidInPeriod * (selfPct / 100);
          report.distributions[partnerEmail].appointmentRevenue += paidInPeriod * (partnerPct / 100);
        } else {
          report.distributions['amr.eladawy@gmail.com'].appointmentRevenue += paidInPeriod * ((partnerPct / 2) / 100);
          report.distributions['basel.elmorsy@gmail.com'].appointmentRevenue += paidInPeriod * ((partnerPct / 2) / 100);
        }
      }
    } else {
      // Manual Invoice: Split 50% / 50%
      report.distributions['amr.eladawy@gmail.com'].manualInvoiceRevenue += paidInPeriod * 0.50;
      report.distributions['basel.elmorsy@gmail.com'].manualInvoiceRevenue += paidInPeriod * 0.50;
    }
  });

  // Gross and Net calculations for each doctor
  Object.keys(report.distributions).forEach(email => {
    const dist = report.distributions[email];
    dist.totalGrossRevenue = dist.appointmentRevenue + dist.treatmentRevenue + dist.manualInvoiceRevenue;
    dist.netProfit = dist.totalGrossRevenue - dist.shareOfExpenses;
  });

  report.totalNetProfit = report.totalRevenue - report.totalExpenses;

  // Calculate detailed snapshot properties
  const isLockedThisPeriod = filter.type === 'month' && filter.month ? (getMonthLocks() || []).includes(filter.month) : false;
  
  // Calculate Dr. Amr and Dr. Basel earnings
  const amrEmail = 'amr.eladawy@gmail.com';
  const baselEmail = 'basel.elmorsy@gmail.com';
  
  const amrDist = report.distributions[amrEmail];
  const baselDist = report.distributions[baselEmail];

  report.isLocked = isLockedThisPeriod;
  report.clinicRevenue = report.totalRevenue;
  report.appointmentRevenue = (amrDist?.appointmentRevenue || 0) + (baselDist?.appointmentRevenue || 0);
  report.treatmentRevenue = (amrDist?.treatmentRevenue || 0) + (baselDist?.treatmentRevenue || 0);
  report.drAmrEarnings = amrDist?.netProfit || 0;
  report.drBaselEarnings = baselDist?.netProfit || 0;
  
  report.expenseDeductions = {
    [amrEmail]: amrDist?.shareOfExpenses || 0,
    [baselEmail]: baselDist?.shareOfExpenses || 0
  };
  
  report.manualInvoiceDistribution = {
    [amrEmail]: amrDist?.manualInvoiceRevenue || 0,
    [baselEmail]: baselDist?.manualInvoiceRevenue || 0
  };

  // Filter transactions of this period
  const ptList = getProfitTransactions() || [];
  report.profitTransactions = ptList.filter(t => isDateInPeriod(t.date, filter));

  // Unpaid/Outstanding sums
  report.unpaidInvoicesSum = invoices
    .filter(inv => inv.status !== 'Paid' && inv.status !== 'Cancelled')
    .reduce((sum, inv) => sum + (inv.totalAmount - inv.paidAmount), 0);

  // Set unpaidTreatmentsSum to 0 to completely remove reliance on totalCost of treatment plan
  report.unpaidTreatmentsSum = 0;

  report.unpaidConsultationsSum = appointments
    .filter(app => app.status === 'Confirmed' || app.status === 'Scheduled')
    .reduce((sum, app) => sum + app.consultationFee, 0);

  return report;
}

// RESTful Delete Backend Sync Helper
export async function deleteWithBackend(key: string, id: string) {
  try {
    const endpoint = `/api/${key.replace("_", "-")}/${id}`;
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
      const token = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    let res = await fetch(endpoint, {
      method: "DELETE",
      headers,
      credentials: "include"
    });

    if (res.status === 401) {
      const refreshed = await attemptTokenRefresh();
      if (refreshed) {
        const freshHeaders: Record<string, string> = {};
        if (typeof window !== "undefined") {
          const freshToken = window.sessionStorage.getItem("azure_access_token") || window.localStorage.getItem("azure_access_token");
          if (freshToken) {
            freshHeaders["Authorization"] = `Bearer ${freshToken}`;
          }
        }
        res = await fetch(endpoint, {
          method: "DELETE",
          headers: freshHeaders,
          credentials: "include"
        });
      }
    }

    if (!res.ok) {
      console.warn(`Backend delete returned non-OK code for key ${key} and id ${id}`);
    }
  } catch (err) {
    console.error(`Failed to delete ${key} with id ${id} from full-stack backend:`, err);
  }
}

// Explicit Delete Functions
export function deletePatient(id: string) {
  dbCache.patients = (dbCache.patients || []).filter((p: any) => p.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.PATIENTS, JSON.stringify(dbCache.patients));
  }
  deleteWithBackend("patients", id);
}

export function deleteAppointment(id: string) {
  dbCache.appointments = (dbCache.appointments || []).filter((a: any) => a.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.APPOINTMENTS, JSON.stringify(dbCache.appointments));
  }
  deleteWithBackend("appointments", id);
}

export function deleteTreatment(id: string) {
  dbCache.treatments = (dbCache.treatments || []).filter((t: any) => t.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.TREATMENTS, JSON.stringify(dbCache.treatments));
  }
  deleteWithBackend("treatments", id);

  // Auto-delete invoices associated with this treatment plan
  const associatedInvoices = (dbCache.invoices || []).filter((inv: any) => inv.treatmentPlanId === id);
  associatedInvoices.forEach((inv: any) => {
    deleteInvoice(inv.id);
  });
}

export function deleteInvoice(id: string) {
  dbCache.invoices = (dbCache.invoices || []).filter((i: any) => i.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.INVOICES, JSON.stringify(dbCache.invoices));
  }
  deleteWithBackend("invoices", id);
}

export function deleteExpense(id: string) {
  dbCache.expenses = (dbCache.expenses || []).filter((e: any) => e.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.EXPENSES, JSON.stringify(dbCache.expenses));
  }
  deleteWithBackend("expenses", id);
}

export function deleteInventory(id: string) {
  dbCache.inventory = (dbCache.inventory || []).filter((i: any) => i.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.INVENTORY, JSON.stringify(dbCache.inventory));
  }
  deleteWithBackend("inventory", id);
}

export function deleteNotification(id: string) {
  dbCache.notifications = (dbCache.notifications || []).filter((n: any) => n.id !== id);
  if (!isLoadedFromBackend) {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(dbCache.notifications));
  }
  deleteWithBackend("notifications", id);
}
