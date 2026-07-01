import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, Trash2, Calendar, DollarSign, RefreshCw, Filter, 
  Upload, Image as ImageIcon, CreditCard, PieChart as PieChartIcon, TrendingUp, TrendingDown,
  Percent, FileText, ArrowUpRight, ArrowDownRight, Award, ShieldAlert, Sparkles, AlertCircle,
  Clock, Eye, Landmark, User, FileSpreadsheet, Lock, Unlock, CheckCircle
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Cell, Pie
} from 'recharts';
import { Expense, ExpenseCategory, ExtendedPatient, MonthlyProfitReport, DoctorProfitDistribution } from '../../adminTypes';
import { 
  getExpenses, saveExpenses, getInvoices, getAppointments, getTreatments, getPatients,
  addNotification, calculateProfitSharingReport, PeriodFilter, isDateInPeriod, getSettlements, saveSettlement, saveMonthLock, deleteExpense
} from '../../clinicDb';

interface FinanceTabProps {
  triggerRefresh: () => void;
}

const CATEGORY_NAMES: Record<ExpenseCategory, string> = {
  Salaries: 'رواتب وأجور الطاقم',
  Rent: 'إيجار مقر العيادة',
  'Dental Supplies': 'مستلزمات ومواد الأسنان',
  Utilities: 'المرافق (كهرباء، مياه، إنترنت)',
  Marketing: 'الدعاية والتسويق الرقمي',
  Miscellaneous: 'مصاريف نثرية عامة'
};

export default function FinanceTab({ triggerRefresh }: FinanceTabProps) {
  // Database data
  const [expenses, setExpenses] = useState<Expense[]>(() => getExpenses());
  const [patients] = useState<ExtendedPatient[]>(() => getPatients());
  const [settlements, setSettlements] = useState<MonthlyProfitReport[]>(() => getSettlements());

  // Search/Filters for Expenses Log
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // New Expense form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Dental Supplies');
  const [amount, setAmount] = useState(120);
  const [payee, setPayee] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState('');
  const [receiptBase64, setReceiptBase64] = useState<string | undefined>(undefined);

  // Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'expenses' | 'distribution' | 'settlements'>('overview');

  // Period Filters State
  const [periodType, setPeriodType] = useState<'month' | 'year' | 'range'>('month');
  const [selectedMonth, setSelectedMonth] = useState<string>(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [customStart, setCustomStart] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [customEnd, setCustomEnd] = useState<string>(() => new Date().toISOString().slice(0, 10));

  // Settlement Viewer Modal State
  const [viewingSettlement, setViewingSettlement] = useState<MonthlyProfitReport | null>(null);

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Re-sync local state when DB refreshes
  const refreshData = () => {
    setExpenses(getExpenses());
    setSettlements(getSettlements());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || amount <= 0 || !payee.trim()) {
      alert('الرجاء تعبئة بيانات المصروف بشكل سليم.');
      return;
    }

    const newExp: Expense = {
      id: 'EXP-' + Math.floor(100000 + Math.random() * 900000).toString(),
      title: title.trim(),
      category,
      amount: Number(amount),
      payee: payee.trim(),
      date,
      notes: notes.trim() || undefined,
      receiptUrl: receiptBase64,
      createdAt: new Date().toISOString()
    };

    const currentList = getExpenses();
    currentList.unshift(newExp);
    saveExpenses(currentList);

    // Add alert notification for supplies below safety thresholds
    if (category === 'Dental Supplies' && Number(amount) > 1000) {
      addNotification(
        'Inventory',
        'Medium',
        `مصروف مستلزمات أسنان: ${title}`,
        `تم تسجيل شراء مواد ومستلزمات طبية بقيمة ${amount} ج.م من المورد ${payee}.`
      );
    }

    // Reset Form
    setTitle('');
    setCategory('Dental Supplies');
    setAmount(120);
    setPayee('');
    setNotes('');
    setReceiptBase64(undefined);
    setShowAddForm(false);

    refreshData();
    triggerRefresh();
  };

  const handleDeleteExpense = (id: string) => {
    setConfirmAction({
      message: 'هل أنت متأكد من حذف هذا المصروف نهائياً من السجلات؟ لا يمكن التراجع عن هذا الإجراء وسيتم تعديل التقارير والأرصدة فوراً.',
      onConfirm: () => {
        deleteExpense(id);
        refreshData();
        triggerRefresh();
      }
    });
  };

  // Construct current dynamic filter
  const getCurrentFilter = (): PeriodFilter => {
    if (periodType === 'month') {
      return { type: 'month', month: selectedMonth };
    } else if (periodType === 'year') {
      return { type: 'year', year: selectedYear };
    } else {
      return { type: 'range', startDate: customStart, endDate: customEnd };
    }
  };

  const currentFilter = getCurrentFilter();

  // Load from finalized settlements if viewing a finalized month YYYY-MM
  const isSelectedMonthFinalized = periodType === 'month' && settlements.some(s => s.month === selectedMonth);
  const finalizedSettlement = isSelectedMonthFinalized 
    ? settlements.find(s => s.month === selectedMonth) 
    : null;

  // Final Report used for metrics
  const activeReport: MonthlyProfitReport = finalizedSettlement || calculateProfitSharingReport(currentFilter);

  // Helper to compute specific doctor breakdowns
  const getDoctorBreakdown = (email: string, reportData: MonthlyProfitReport, filter: PeriodFilter) => {
    const isAmr = email === 'amr.eladawy@gmail.com';
    const partnerEmail = isAmr ? 'basel.elmorsy@gmail.com' : 'amr.eladawy@gmail.com';

    const appointmentsList = getAppointments();
    const invoicesList = getInvoices();

    // 1. Own Appointments Revenue: completed and matches period
    // Direct Completed appointments without an associated invoice
    const directOwnAppts = appointmentsList.filter(app => 
      isDateInPeriod(app.date, filter) && 
      app.status === 'Completed' && 
      app.doctorEmail === email &&
      !invoicesList.some(inv => inv.appointmentId === app.id)
    );
    const directOwnApptRev = directOwnAppts.reduce((sum, app) => sum + app.consultationFee, 0);

    // Invoiced Completed appointments payments in the period
    const invoicedOwnApptRev = invoicesList.reduce((sum, inv) => {
      if (inv.status === 'Cancelled' || !inv.appointmentId) return sum;
      const appt = appointmentsList.find(a => a.id === inv.appointmentId);
      if (appt && appt.status === 'Completed' && appt.doctorEmail === email) {
        const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
        return sum + periodPayments.reduce((s, p) => s + p.amount, 0);
      }
      return sum;
    }, 0);

    const ownApptRev = directOwnApptRev + invoicedOwnApptRev;

    // 2. Own Treatments Revenue: payments in selected period on invoices linked to treatment plans
    const ownTrtRev = invoicesList.reduce((sum, inv) => {
      if (inv.status === 'Cancelled' || !inv.treatmentPlanId) return sum;
      
      const patientAppointments = appointmentsList.filter(app => app.patientId === inv.patientId);
      const latestApp = patientAppointments.length > 0 ? patientAppointments[0] : null;
      const docEmail = latestApp ? latestApp.doctorEmail : 'amr.eladawy@gmail.com';
      
      if (docEmail === email) {
        const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
        return sum + periodPayments.reduce((s, p) => s + p.amount, 0);
      }
      return sum;
    }, 0);

    // Partner values (to compute 35% commission)
    // Direct Completed partner appointments without an associated invoice
    const directPartnerAppts = appointmentsList.filter(app => 
      isDateInPeriod(app.date, filter) && 
      app.status === 'Completed' && 
      app.doctorEmail === partnerEmail &&
      !invoicesList.some(inv => inv.appointmentId === app.id)
    );
    const directPartnerApptRev = directPartnerAppts.reduce((sum, app) => sum + app.consultationFee, 0);

    // Invoiced Completed partner appointments payments in the period
    const invoicedPartnerApptRev = invoicesList.reduce((sum, inv) => {
      if (inv.status === 'Cancelled' || !inv.appointmentId) return sum;
      const appt = appointmentsList.find(a => a.id === inv.appointmentId);
      if (appt && appt.status === 'Completed' && appt.doctorEmail === partnerEmail) {
        const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
        return sum + periodPayments.reduce((s, p) => s + p.amount, 0);
      }
      return sum;
    }, 0);

    const partnerApptRev = directPartnerApptRev + invoicedPartnerApptRev;

    const partnerTrtRev = invoicesList.reduce((sum, inv) => {
      if (inv.status === 'Cancelled' || !inv.treatmentPlanId) return sum;
      
      const patientAppointments = appointmentsList.filter(app => app.patientId === inv.patientId);
      const latestApp = patientAppointments.length > 0 ? patientAppointments[0] : null;
      const docEmail = latestApp ? latestApp.doctorEmail : 'amr.eladawy@gmail.com';
      
      if (docEmail === partnerEmail) {
        const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
        return sum + periodPayments.reduce((s, p) => s + p.amount, 0);
      }
      return sum;
    }, 0);

    // Manual invoices split 50/50
    const manualRev = invoicesList.reduce((sum, inv) => {
      if (inv.status === 'Cancelled' || inv.treatmentPlanId || inv.appointmentId) return sum;
      const periodPayments = inv.payments.filter(p => isDateInPeriod(p.date, filter));
      return sum + periodPayments.reduce((s, p) => s + p.amount, 0);
    }, 0);

    // Formulas
    const earnings65 = (ownApptRev + ownTrtRev) * 0.65;
    const partnerEarnings35 = (partnerApptRev + partnerTrtRev) * 0.35;
    const manualShare = manualRev * 0.50;
    const expenseDeductions = reportData.totalExpenses / 2;
    const finalPayable = (earnings65 + partnerEarnings35 + manualShare) - expenseDeductions;

    return {
      apptRevenue: ownApptRev,
      trtRevenue: ownTrtRev,
      manualRevenue: manualRev,
      earnings65,
      partnerEarnings35,
      manualShare,
      expenseDeductions,
      finalPayableAmount: finalPayable
    };
  };

  // Get active stats for Dr Amr & Dr Basel
  const amrStats = isSelectedMonthFinalized && finalizedSettlement?.distributions['amr.eladawy@gmail.com']
    ? {
        apptRevenue: finalizedSettlement.distributions['amr.eladawy@gmail.com'].appointmentRevenue / 0.65, // reconstruct roughly or use stored values
        trtRevenue: finalizedSettlement.distributions['amr.eladawy@gmail.com'].treatmentRevenue / 0.65,
        manualRevenue: finalizedSettlement.distributions['amr.eladawy@gmail.com'].manualInvoiceRevenue / 0.5,
        earnings65: finalizedSettlement.distributions['amr.eladawy@gmail.com'].appointmentRevenue, 
        partnerEarnings35: 0, // already consolidated in final reporting
        manualShare: finalizedSettlement.distributions['amr.eladawy@gmail.com'].manualInvoiceRevenue,
        expenseDeductions: finalizedSettlement.distributions['amr.eladawy@gmail.com'].shareOfExpenses,
        finalPayableAmount: finalizedSettlement.distributions['amr.eladawy@gmail.com'].netProfit
      }
    : getDoctorBreakdown('amr.eladawy@gmail.com', activeReport, currentFilter);

  const baselStats = isSelectedMonthFinalized && finalizedSettlement?.distributions['basel.elmorsy@gmail.com']
    ? {
        apptRevenue: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].appointmentRevenue / 0.65,
        trtRevenue: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].treatmentRevenue / 0.65,
        manualRevenue: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].manualInvoiceRevenue / 0.5,
        earnings65: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].appointmentRevenue,
        partnerEarnings35: 0,
        manualShare: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].manualInvoiceRevenue,
        expenseDeductions: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].shareOfExpenses,
        finalPayableAmount: finalizedSettlement.distributions['basel.elmorsy@gmail.com'].netProfit
      }
    : getDoctorBreakdown('basel.elmorsy@gmail.com', activeReport, currentFilter);

  // Dynamic Pie Chart Data
  const profitPieData = [
    { name: 'د. عمرو العدوي', value: Math.max(0, Math.round(amrStats.finalPayableAmount)), color: '#3b82f6' },
    { name: 'د. باسل المرسي', value: Math.max(0, Math.round(baselStats.finalPayableAmount)), color: '#6366f1' },
    { name: 'المصروفات النقدية التشغيلية', value: Math.max(0, Math.round(activeReport.totalExpenses)), color: '#f43f5e' }
  ];

  // Dynamic Monthly Performance comparison compiled for 2026
  const compileMonthlyPerformance = () => {
    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    return monthNames.map((m, idx) => {
      const monthStr = `2026-${String(idx + 1).padStart(2, '0')}`;
      // Use finalized or live
      const saved = settlements.find(s => s.month === monthStr);
      const rep = saved || calculateProfitSharingReport({ type: 'month', month: monthStr });
      return {
        month: m,
        revenue: rep.totalRevenue,
        expense: rep.totalExpenses
      };
    });
  };

  const chartData = compileMonthlyPerformance();

  const getUserRole = (): string => {
    return sessionStorage.getItem('azure_user_role') || 'ADMIN';
  };

  const getUserEmail = (): string => {
    return sessionStorage.getItem('azure_user_email') || 'admin@clinic.com';
  };

  const isAdmin = getUserRole() === 'ADMIN' || getUserRole() === 'SUPER_ADMIN';

  // Finalize monthly account & lock in historical report
  const handleFinalizeMonth = async () => {
    if (periodType !== 'month') return;
    setConfirmAction({
      message: `تنبيه مالي هام:\nهل أنت متأكد من إغلاق وترحيل تسوية شهر (${selectedMonth})؟\nهذه الخطوة ستقوم بأرشفة كافة الحسابات، الأرباح، الحصص والمصروفات الخاصة بهذا الشهر ولن تتأثر بالتعديلات اللاحقة على كشوفات المرضى.`,
      onConfirm: async () => {
        // Calculate final stable report
        const reportToSave = calculateProfitSharingReport(currentFilter);
        reportToSave.isLocked = true;
        reportToSave.closedAt = new Date().toISOString();
        reportToSave.closedBy = getUserEmail();
        
        try {
          saveSettlement(reportToSave);
          await saveMonthLock(selectedMonth, 'lock');

          addNotification(
            'System',
            'High',
            `إغلاق الحسابات لشهر ${selectedMonth}`,
            `تم إغلاق وترحيل الحسابات وتوزيع الأرباح لشهر ${selectedMonth} بنجاح. الحصص المغلقة أصبحت مؤرشفة الآن.`
          );

          refreshData();
          triggerRefresh();
          alert('تم إغلاق الحسابات بنجاح وأرشفة التسوية في السجلات التاريخية للعيادة ✓');
        } catch (err: any) {
          alert(err.message || 'فشل إقفال الشهر');
        }
      }
    });
  };

  const handleReopenMonth = async () => {
    if (periodType !== 'month') return;
    if (!isAdmin) {
      alert('عذراً، فقط المسؤول (ADMIN) يمكنه إعادة فتح الأشهر المقفلة.');
      return;
    }
    setConfirmAction({
      message: `تنبيه أمان هام:\nهل أنت متأكد من إعادة فتح الحسابات لشهر (${selectedMonth})؟\nهذه الخطوة ستسمح بتعديل الفواتير، الدفعات والمصروفات لهذا الشهر وإعادة حساب الأرباح.`,
      onConfirm: async () => {
        try {
          await saveMonthLock(selectedMonth, 'unlock');
          const reopenedSettlement = settlements.find(s => s.month === selectedMonth);
          if (reopenedSettlement) {
            reopenedSettlement.isLocked = false;
            saveSettlement(reopenedSettlement);
          }
          
          addNotification(
            'System',
            'High',
            `إعادة فتح الحسابات لشهر ${selectedMonth}`,
            `قام المسؤول بإعادة فتح الحسابات لشهر ${selectedMonth}. أصبح بالإمكان تعديل الفواتير والمصروفات الآن.`
          );

          refreshData();
          triggerRefresh();
          alert('تم إعادة فتح الشهر بنجاح ✓');
        } catch (err: any) {
          alert(err.message || 'فشل إعادة فتح الشهر');
        }
      }
    });
  };

  // Filter expenses list based on search and category
  const filteredExpenses = expenses.filter(e => {
    // Also restrict expenses log based on active period filter to keep accounting period-clean!
    const inPeriod = isDateInPeriod(e.date, currentFilter);
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    const titleVal = e.title || e.description || '';
    const payeeVal = e.payee || e.supplier || '';
    const matchesSearch = 
      titleVal.toLowerCase().includes(search.toLowerCase()) || 
      payeeVal.toLowerCase().includes(search.toLowerCase());
    return inPeriod && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl" id="finance-tab-wrapper">
      
      {/* Dynamic Period Filter Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4" id="period-filter-bar">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
              <Filter className="w-5 h-5 text-indigo-500" />
              <span>تحديد الفترة المحاسبية للتقارير والتحليلات</span>
            </h3>
            <p className="text-[10.5px] text-slate-400 font-bold">جميع الحسابات والتدفقات النقدية والأرباح ستنطلق بالكامل وتصفي من الصفر بناءً على خيارك</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPeriodType('month')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodType === 'month' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              تقرير شهري
            </button>
            <button
              onClick={() => setPeriodType('year')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodType === 'year' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              تقرير سنوي شامل
            </button>
            <button
              onClick={() => setPeriodType('range')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                periodType === 'range' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              فترة مخصصة 🗓️
            </button>
          </div>
        </div>

        {/* Dynamic Period Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-slate-50">
          {periodType === 'month' && (
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">اختر الشهر المحاسبي</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold font-mono focus:bg-white"
              />
            </div>
          )}

          {periodType === 'year' && (
            <div className="col-span-1">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">اختر السنة المحاسبية</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold text-slate-700 focus:bg-white"
              >
                <option value="2026">عام 2026</option>
                <option value="2025">عام 2025</option>
              </select>
            </div>
          )}

          {periodType === 'range' && (
            <>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">تاريخ البداية</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold font-mono focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">تاريخ النهاية</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/60 rounded-xl text-xs font-bold font-mono focus:bg-white"
                />
              </div>
            </>
          )}

          {/* Settle / Finalize Actions or Status Badges */}
          <div className="flex items-end justify-start md:justify-end gap-3 md:col-span-1">
            {periodType === 'month' && (
              isSelectedMonthFinalized ? (
                <div className="flex items-center gap-2">
                  <div className="px-4 py-2 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-xl text-xs font-black flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>تم إغلاق وتسوية الحسابات ✓</span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={handleReopenMonth}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-amber-500/15 cursor-pointer"
                    >
                      <Unlock className="w-4 h-4" />
                      <span>إعادة فتح الشهر</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleFinalizeMonth}
                  className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-rose-500/15 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>إقفال الحسابات وترحيل الأرباح</span>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Sub tabs strip */}
      <div className="flex border-b border-slate-100" id="finance-tabs-nav">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'overview' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          التقارير المالية والتحليل الشامل 📊
        </button>
        <button
          onClick={() => setActiveSubTab('expenses')}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'expenses' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          سجل المصروفات والنفقات 💸
        </button>
        <button
          onClick={() => setActiveSubTab('distribution')}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'distribution' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          توزيع أرباح الأطباء بالتفصيل ⚖️
        </button>
        <button
          onClick={() => setActiveSubTab('settlements')}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'settlements' ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          التسويات الشهرية المؤرشفة 🗄️
        </button>
      </div>

      {/* OVERVIEW SUB-TAB */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6 animate-fade-in" id="overview-pane">
          
          {/* Bento Grid Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block uppercase">إجمالي إيرادات العيادة</span>
                <strong className="text-xl text-emerald-600 font-mono font-black">{activeReport.totalRevenue} ج.م</strong>
                <span className="text-[9px] text-slate-400 block mt-0.5">الرصيد الوارد المحصل بالفترة</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                <ArrowUpRight className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block uppercase">إجمالي المصروفات والنفقات</span>
                <strong className="text-xl text-rose-600 font-mono font-black">{activeReport.totalExpenses} ج.م</strong>
                <span className="text-[9px] text-slate-400 block mt-0.5">قيمة المشتريات والرواتب المصروفة</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                <ArrowDownRight className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block uppercase">صافي الأرباح المحققة</span>
                <strong className={`text-xl font-mono font-black ${activeReport.totalNetProfit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                  {activeReport.totalNetProfit} ج.م
                </strong>
                <span className="text-[9px] text-slate-400 block mt-0.5">الإيرادات المحصلة مطروح منها المصاريف</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-400 block uppercase">مستحقات معلقة بالخارج</span>
                <strong className="text-xl text-slate-700 font-mono font-black">
                  {patients.reduce((sum, p) => sum + p.outstandingBalance, 0)} ج.م
                </strong>
                <span className="text-[9px] text-slate-400 block mt-0.5">أرصدة وذمم المرضى غير المسددة بعد</span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-500 flex items-center justify-center shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Bar chart - 2026 performance */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
                <span>مقارنة الأداء والتدفق النقدي الشهري لعام 2026 (ج.م)</span>
              </h3>

              <div className="h-80 w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Bar dataKey="revenue" name="إيرادات (ج.م)" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expense" name="نفقات (ج.م)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Profit Split Pie */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5 text-indigo-500" />
                  <span>توزيع التدفق المالي للفترة الحالية</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-bold mt-1">توضيح أين تذهب الأموال ونسب المستحقات للأطراف</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center" dir="ltr">
                {profitPieData.every(d => d.value === 0) ? (
                  <div className="text-center text-xs text-slate-400 font-bold p-8">لا توجد تدفقات مالية في الفترة المحددة</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={profitPieData.filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {profitPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `${value} ج.م`} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-2 text-xs border-t border-slate-50 pt-3">
                {profitPieData.map((d, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                      <span className="font-bold text-slate-600">{d.name}</span>
                    </div>
                    <strong className="text-slate-900 font-mono">{d.value} ج.م</strong>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EXPENSES LOG SUB-TAB */}
      {activeSubTab === 'expenses' && (
        <div className="space-y-6 animate-fade-in" id="expenses-pane">
          
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="ابحث بالبيان أو المورد..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none w-full sm:w-64"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none focus:bg-white"
              >
                <option value="all">كل فئات المصاريف</option>
                {Object.entries(CATEGORY_NAMES).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            {isSelectedMonthFinalized ? (
              <div className="px-4 py-2 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-black flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-rose-500" />
                <span>الشهر مقفل محاسبياً: يمنع تسجيل مصاريف جديدة</span>
              </div>
            ) : (
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm shadow-rose-500/15 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>تسجيل مصروف مالي جديد</span>
              </button>
            )}
          </div>

          {/* Add Expense Form */}
          {showAddForm && (
            <form onSubmit={handleAddExpense} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
              <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-rose-500" />
                <span>إثبات وتسجيل نفقات نقدية بالعيادة</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">البيان / تفصيل المصروف *</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="مثال: شراء كيت حشو عصب فايبر"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">تصنيف وبند النفقات *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:bg-white"
                  >
                    {Object.entries(CATEGORY_NAMES).map(([key, name]) => (
                      <option key={key} value={key}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">القيمة الإجمالية (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-rose-600 focus:bg-white"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">المورد / الجهة المستلمة *</label>
                  <input
                    type="text"
                    required
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="مثال: شركة سيف فارما للمستلزمات"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ النفقات</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">ملاحظات توضيحية</label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="تفاصيل التوريد أو الفاتورة اليدوية..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">إرفاق إيصال / فاتورة الشراء</label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full"
                    />
                    <div className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center justify-center gap-1.5">
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>{receiptBase64 ? 'تم إرفاق الإيصال بنجاح ✓' : 'انقر لإرفاق الفاتورة'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء الحفظ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  حفظ وتسجيل المصروف ✓
                </button>
              </div>
            </form>
          )}

          {/* Expenses List */}
          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold">
                    <th className="p-4">بيان المصروف</th>
                    <th className="p-4">الفئة والتبويب</th>
                    <th className="p-4">تاريخ الصرف</th>
                    <th className="p-4">المورد / الجهة المستلمة</th>
                    <th className="p-4 text-left">قيمة الفاتورة</th>
                    <th className="p-4 text-center">الإيصال والعمليات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">لا توجد سجلات نفقات مطابقة للبحث أو معلقة في هذه الفترة.</td>
                    </tr>
                  ) : (
                    filteredExpenses.map(exp => (
                      <tr key={exp.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-800">{exp.title || exp.description}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{exp.id}</div>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600">
                            {CATEGORY_NAMES[exp.category]}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600 font-mono font-bold">{exp.date}</td>
                        <td className="p-4 font-bold text-indigo-700">{exp.payee || exp.supplier}</td>
                        <td className="p-4 text-left font-mono font-black text-rose-600 text-sm">-{exp.amount} ج.م</td>
                        <td className="p-4 text-center flex items-center justify-center gap-2">
                          {exp.receiptUrl ? (
                            <a
                              href={exp.receiptUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 hover:bg-slate-100 rounded-lg text-slate-600"
                              title="معاينة الفاتورة المرفقة"
                            >
                              <ImageIcon className="w-4.5 h-4.5" />
                            </a>
                          ) : (
                            <span className="w-4.5 h-4.5" />
                          )}

                          {!isSelectedMonthFinalized && (
                            <button
                              onClick={() => handleDeleteExpense(exp.id)}
                              className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                              title="حذف القيد نهائياً"
                            >
                              <Trash2 className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* DISTRIBUTION SUB-TAB */}
      {activeSubTab === 'distribution' && (
        <div className="space-y-6 animate-fade-in" id="distribution-pane">
          
          {/* Rules Banner */}
          <div className="bg-amber-50 border border-amber-200/60 p-4 rounded-2xl flex items-start gap-3 text-xs">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1 text-amber-800">
              <strong className="font-black block text-sm">قواعد وآلية توزيع الأرباح الآلية بالعيادة:</strong>
              <ul className="list-disc pr-4 space-y-1 text-[11px] font-bold">
                <li><strong>الجهد المباشر (65%):</strong> يحصل الطبيب المنفذ للكشف أو جلسة العلاج المكتملة على نسبة 65% من إيراداتها فوراً دون أي تدخل يدوي.</li>
                <li><strong>المساندة والمشاركة (35%):</strong> يحصل شريكه الطبيب الآخر تلقائياً على 35% من قيمة الإيرادات لدعم العيادة المشتركة.</li>
                <li><strong>المبيعات العامة (50% / 50%):</strong> توزع إيرادات الفواتير اليدوية غير المرتبطة بطبيب معين بالتساوي بين الشريكين.</li>
                <li><strong>النفقات والمصاريف (50% / 50%):</strong> يتم تجميع المصروفات التشغيلية بالفترة وخصمها بالتساوي بين د. عمرو ود. باسل.</li>
              </ul>
            </div>
          </div>

          {/* Doctor Sheets Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dr Amr Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">د. عمرو العدوي</h3>
                  <span className="text-[10px] text-slate-400 font-bold block">amr.eladawy@gmail.com</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl">
                  <span className="text-slate-500 font-bold">إجمالي كشوفات د. عمرو المحققة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{amrStats.apptRevenue} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl">
                  <span className="text-slate-500 font-bold">إجمالي جلسات د. عمرو المحققة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{amrStats.trtRevenue} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl border-b border-dashed border-slate-100 pb-3">
                  <span className="text-slate-500 font-bold">إجمالي الفواتير العامة اليدوية المشتركة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{amrStats.manualRevenue} ج.م</strong>
                </div>

                <div className="flex justify-between items-center text-xs text-blue-700 font-bold p-1">
                  <span>• حصة الجهد المباشر من جلساته وكشوفاته (65%):</span>
                  <strong className="font-mono">{Math.round(amrStats.earnings65)} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-indigo-600 font-bold p-1">
                  <span>• حصة مساندة شريكه د. باسل (35%):</span>
                  <strong className="font-mono">{Math.round(amrStats.partnerEarnings35)} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 font-bold p-1">
                  <span>• حصة الفواتير اليدوية العامة (50%):</span>
                  <strong className="font-mono">{Math.round(amrStats.manualShare)} ج.m</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-600 font-bold p-1 border-b border-slate-50 pb-3">
                  <span>• نصيب الخصم من المصروفات التشغيلية (50%):</span>
                  <strong className="font-mono">-{Math.round(amrStats.expenseDeductions)} ج.م</strong>
                </div>

                <div className="flex justify-between items-center bg-blue-50/60 p-4 rounded-2xl text-blue-800">
                  <span className="text-xs font-black">صافي المبلغ المستحق للدفع:</span>
                  <strong className="text-base font-mono font-black">{Math.round(amrStats.finalPayableAmount)} ج.م</strong>
                </div>
              </div>
            </div>

            {/* Dr Basel Breakdown Card */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-800 text-sm">د. باسل المرسي</h3>
                  <span className="text-[10px] text-slate-400 font-bold block">basel.elmorsy@gmail.com</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl">
                  <span className="text-slate-500 font-bold">إجمالي كشوفات د. باسل المحققة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{baselStats.apptRevenue} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl">
                  <span className="text-slate-500 font-bold">إجمالي جلسات د. باسل المحققة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{baselStats.trtRevenue} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs p-2.5 bg-slate-50/50 rounded-xl border-b border-dashed border-slate-100 pb-3">
                  <span className="text-slate-500 font-bold">إجمالي الفواتير العامة اليدوية المشتركة:</span>
                  <strong className="text-slate-800 font-mono font-bold">{baselStats.manualRevenue} ج.م</strong>
                </div>

                <div className="flex justify-between items-center text-xs text-indigo-700 font-bold p-1">
                  <span>• حصة الجهد المباشر من جلساته وكشوفاته (65%):</span>
                  <strong className="font-mono">{Math.round(baselStats.earnings65)} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-blue-600 font-bold p-1">
                  <span>• حصة مساندة شريكه د. عمرو (35%):</span>
                  <strong className="font-mono">{Math.round(baselStats.partnerEarnings35)} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 font-bold p-1">
                  <span>• حصة الفواتير اليدوية العامة (50%):</span>
                  <strong className="font-mono">{Math.round(baselStats.manualShare)} ج.م</strong>
                </div>
                <div className="flex justify-between items-center text-xs text-rose-600 font-bold p-1 border-b border-slate-50 pb-3">
                  <span>• نصيب الخصم من المصروفات التشغيلية (50%):</span>
                  <strong className="font-mono">-{Math.round(baselStats.expenseDeductions)} ج.م</strong>
                </div>

                <div className="flex justify-between items-center bg-indigo-50/60 p-4 rounded-2xl text-indigo-800">
                  <span className="text-xs font-black">صافي المبلغ المستحق للدفع:</span>
                  <strong className="text-base font-mono font-black">{Math.round(baselStats.finalPayableAmount)} ج.م</strong>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* SETTLEMENTS HISTORY SUB-TAB */}
      {activeSubTab === 'settlements' && (
        <div className="space-y-6 animate-fade-in" id="settlements-pane">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
            <div className="space-y-1">
              <h3 className="font-black text-slate-800 text-sm flex items-center gap-1.5">
                <Landmark className="w-5 h-5 text-indigo-500" />
                <span>أرشيف التسويات والحسابات المعتمدة والمرحلة</span>
              </h3>
              <p className="text-[10.5px] text-slate-400 font-bold">تسويات تاريخية مغلقة غير قابلة للتعديل أو التغيير الآلي لحفظ توازن ميزانية العيادة</p>
            </div>

            {settlements.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs space-y-2">
                <FileText className="w-12 h-12 text-slate-200 mx-auto" />
                <p>لا توجد أي تسويات شهرية مغلقة ومرحلة بعد.</p>
                <p className="text-[10px] text-slate-400">يمكنك تسوية وإغلاق أي شهر محاسبي بالانتقال للتقارير وتحديد الشهر، ثم النقر على "إقفال الحسابات".</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {settlements.map((sett, idx) => (
                  <div key={idx} className="bg-slate-50/40 p-5 rounded-2xl border border-slate-100 flex flex-col justify-between gap-4 hover:border-slate-200 transition-all">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <strong className="text-sm text-slate-800 font-mono font-black">{sett.month}</strong>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[10px] font-black text-emerald-600">مغلق ومؤرشف ✓</span>
                      </div>
                      
                      <div className="text-[11px] text-slate-500 space-y-1 pt-1">
                        <p className="flex justify-between"><span>المبيعات الكلية:</span> <strong className="text-slate-800 font-mono">{sett.totalRevenue} ج.م</strong></p>
                        <p className="flex justify-between"><span>النفقات المخصومة:</span> <strong className="text-slate-800 font-mono">-{sett.totalExpenses} ج.م</strong></p>
                        <p className="flex justify-between"><span>صافي الربح الموزع:</span> <strong className="text-indigo-600 font-mono">{sett.totalNetProfit} ج.م</strong></p>
                      </div>
                    </div>

                    <button
                      onClick={() => setViewingSettlement(sett)}
                      className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-4 h-4" />
                      <span>معاينة المستند المالي بالتفصيل</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Immutable Settlement Detail Modal Viewer */}
      {viewingSettlement && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="settlement-modal-backdrop">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6" id="settlement-modal-content">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                <div>
                  <h3 className="font-black text-slate-800 text-base">مستند التسوية المالية المعتمد والمغلق</h3>
                  <span className="text-[10px] text-slate-400 font-black block">شهر المحاسبة المؤرشف: {viewingSettlement.month}</span>
                </div>
              </div>
              <button
                onClick={() => setViewingSettlement(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-black text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold">المبيعات الكلية</span>
                  <strong className="text-sm font-mono text-emerald-600 font-black">{viewingSettlement.totalRevenue} ج.م</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold">النفقات المخصومة</span>
                  <strong className="text-sm font-mono text-rose-500 font-black">-{viewingSettlement.totalExpenses} ج.م</strong>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                  <span className="block text-[10px] text-slate-400 font-bold">الربح الصافي الموزع</span>
                  <strong className="text-sm font-mono text-indigo-600 font-black">{viewingSettlement.totalNetProfit} ج.م</strong>
                </div>
              </div>

              {/* Doctors detailed distribution shares stored in this settlement */}
              <div className="space-y-4">
                <h4 className="font-black text-xs text-slate-700">توزيع حصص الأرباح المعتمدة:</h4>
                
                {Object.values(viewingSettlement.distributions).map((dist: DoctorProfitDistribution, index) => (
                  <div key={index} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center border-b border-slate-100/60 pb-2">
                      <strong className="text-xs text-indigo-950 font-black">{dist.doctorName}</strong>
                      <span className="text-[10px] text-slate-400 font-bold font-mono">{dist.doctorEmail}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-slate-500 font-bold">
                      <div>
                        <span className="text-[9px] text-slate-400 block mb-0.5">عمولات عيادة (65%)</span>
                        <strong className="text-slate-700 font-mono">{Math.round(dist.appointmentRevenue)} ج.م</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block mb-0.5">عمولات جلسات (65%)</span>
                        <strong className="text-slate-700 font-mono">{Math.round(dist.treatmentRevenue)} ج.م</strong>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 block mb-0.5">فواتير عامة (50%)</span>
                        <strong className="text-slate-700 font-mono">{Math.round(dist.manualInvoiceRevenue)} ج.م</strong>
                      </div>
                      <div className="text-rose-600">
                        <span className="text-[9px] text-slate-400 block mb-0.5">خصم المصروفات (50%)</span>
                        <strong className="font-mono">-{Math.round(dist.shareOfExpenses)} ج.م</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl text-indigo-800 text-xs mt-2">
                      <span className="font-black">المستحقات الصافية المصروفة:</span>
                      <strong className="font-mono font-black">{Math.round(dist.netProfit)} ج.م</strong>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setViewingSettlement(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                إغلاق المستند ✓
              </button>
            </div>

          </div>
        </div>
      )}

      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right animate-scale-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800 text-center mb-2">تأكيد الإجراء ⚠️</h3>
            <p className="text-slate-600 text-xs text-center mb-6 leading-relaxed whitespace-pre-line">
              {confirmAction.message}
            </p>
            <div className="flex flex-row-reverse gap-3">
              <button
                onClick={() => {
                  confirmAction.onConfirm();
                  setConfirmAction(null);
                }}
                className="flex-1 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer text-center"
              >
                نعم، متأكد ومتابعة 🗑️
              </button>
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
              >
                إلغاء ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
