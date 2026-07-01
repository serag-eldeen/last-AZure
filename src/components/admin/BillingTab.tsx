import React, { useState } from 'react';
import { 
  Plus, Check, CheckSquare, Trash2, FileSpreadsheet, RefreshCw, DollarSign, 
  User, Eye, Calendar, Tag, ShieldCheck, Printer, AlertTriangle, FileText, Ban 
} from 'lucide-react';
import { Invoice, InvoiceItem, Payment, InvoiceStatus, ExtendedPatient } from '../../adminTypes';
import { getInvoices, saveInvoices, getPatients, recalculatePatientBalances, addNotification, getMonthLocks, deleteInvoice } from '../../clinicDb';

interface BillingTabProps {
  triggerRefresh: () => void;
}

export default function BillingTab({ triggerRefresh }: BillingTabProps) {
  const [invoices, setInvoices] = useState<Invoice[]>(() => getInvoices());
  const [patients] = useState<ExtendedPatient[]>(() => getPatients());

  // Helper to check if a date falls in a locked month
  const isDateLocked = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const month = dateStr.slice(0, 7); // YYYY-MM
    const locks = getMonthLocks() || [];
    return locks.includes(month);
  };

  // Search/Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Invoice Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [discount, setDiscount] = useState(0);
  const [tax, setTax] = useState(14); // default 14% tax
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  
  // Invoice Items
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'كشف واستشارة طبية عامة', quantity: 1, unitPrice: 200 }
  ]);
  const [newDesc, setNewDesc] = useState('');
  const [newQty, setNewQty] = useState(1);
  const [newPrice, setNewPrice] = useState(0);

  // Active viewing/printing invoice state
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Payment capture
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card' | 'InstaPay' | 'Insurance'>('Cash');
  const [payNotes, setPayNotes] = useState('');

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const refreshData = () => {
    setInvoices(getInvoices());
  };

  const handleAddItemToForm = () => {
    if (!newDesc.trim() || newPrice <= 0) {
      alert('يرجى ملء تفاصيل العنصر بشكل صحيح.');
      return;
    }
    const newItem: InvoiceItem = {
      id: 'ITM-' + Math.floor(100000 + Math.random() * 900000).toString(),
      description: newDesc.trim(),
      quantity: Number(newQty),
      unitPrice: Number(newPrice)
    };
    setItems([...items, newItem]);
    setNewDesc('');
    setNewQty(1);
    setNewPrice(0);
  };

  const handleRemoveItemFromForm = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('يرجى اختيار مريض من قائمة الدليل أولاً.');
      return;
    }
    if (items.length === 0) {
      alert('يجب إضافة بند واحد على الأقل لإنشاء الفاتورة.');
      return;
    }

    const today = new Date().toISOString().slice(0, 10);
    if (isDateLocked(today)) {
      alert('عذراً، هذا الشهر مقفل محاسبياً. لا يمكن إنشاء فواتير جديدة في فترة مقفلة.');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    // Sequence ID generation
    const currentList = getInvoices();
    const count = currentList.length;
    const invNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;

    // Calculate invoice totals
    const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    const afterDiscount = subtotal - Number(discount);
    const totalAmount = Math.max(0, Math.round(afterDiscount * (1 + Number(tax) / 100)));

    const newInvoice: Invoice = {
      id: invNumber,
      patientId: selectedPatientId,
      date: new Date().toISOString().slice(0, 10),
      dueDate,
      items,
      discount: Number(discount),
      tax: Number(tax),
      status: 'Sent', // Default to sent
      payments: [],
      totalAmount,
      paidAmount: 0,
      createdAt: new Date().toISOString()
    };

    currentList.unshift(newInvoice);
    saveInvoices(currentList);

    // Add notification
    addNotification(
      'Payments',
      'Medium',
      `فاتورة جديدة: ${patient.name}`,
      `تم إصدار الفاتورة رقم ${invNumber} بقيمة إجمالية ${totalAmount} ج.م ومستحقة الدفع بتاريخ ${dueDate}.`,
      selectedPatientId
    );

    // Reset Form
    setSelectedPatientId('');
    setDiscount(0);
    setTax(14);
    setItems([{ id: '1', description: 'كشف واستشارة طبية عامة', quantity: 1, unitPrice: 200 }]);
    setShowAddForm(false);

    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingInvoiceId) return;

    const currentList = getInvoices();
    const inv = currentList.find(i => i.id === payingInvoiceId);
    if (inv) {
      const today = new Date().toISOString().slice(0, 10);
      if (isDateLocked(inv.date) || isDateLocked(today)) {
        alert('عذراً، لا يمكن تسجيل مدفوعات في فترة محاسبية مقفلة.');
        return;
      }
    }

    const updated = currentList.map(inv => {
      if (inv.id === payingInvoiceId) {
        const newPayment: Payment = {
          id: 'PAY-' + Math.floor(100000 + Math.random() * 900000).toString(),
          date: new Date().toISOString().slice(0, 10),
          amount: Number(payAmount),
          method: payMethod,
          notes: payNotes.trim() || undefined
        };

        const totalPaid = inv.paidAmount + Number(payAmount);
        let status: InvoiceStatus = 'Partially Paid';
        if (totalPaid >= inv.totalAmount) {
          status = 'Paid';
        }

        return {
          ...inv,
          payments: [...inv.payments, newPayment],
          paidAmount: totalPaid > inv.totalAmount ? inv.totalAmount : totalPaid,
          status
        };
      }
      return inv;
    });

    saveInvoices(updated);
    setPayingInvoiceId(null);
    setPayAmount(0);
    setPayNotes('');
    
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  const handleCancelInvoice = (invoiceId: string) => {
    const currentList = getInvoices();
    const inv = currentList.find(i => i.id === invoiceId);
    if (inv && isDateLocked(inv.date)) {
      alert('عذراً، لا يمكن تعديل أو إلغاء فواتير في شهر مقفل محاسبياً.');
      return;
    }

    setConfirmAction({
      message: 'هل أنت متأكد من إلغاء هذه الفاتورة؟ سيتم إلغاء المبالغ المستحقة بالكامل وتعديل رصيد المريض تلقائياً.',
      onConfirm: () => {
        const updated = currentList.map(inv => {
          if (inv.id === invoiceId) {
            addNotification(
              'Payments',
              'High',
              `فاتورة ملغاة: ${inv.id}`,
              `تم إلغاء الفاتورة رقم ${inv.id} وإسقاط مستحقاتها المالية بالكامل.`
            );
            return { ...inv, status: 'Cancelled' as const };
          }
          return inv;
        });
        saveInvoices(updated);
        refreshData();
        recalculatePatientBalances();
        triggerRefresh();
      }
    });
  };

  const handleDeleteInvoiceCompletely = (invoiceId: string) => {
    const currentList = getInvoices();
    const inv = currentList.find(i => i.id === invoiceId);
    if (inv && isDateLocked(inv.date)) {
      alert('عذراً، لا يمكن حذف فواتير تتبع لفترة محاسبية مقفلة.');
      return;
    }

    const userRole = sessionStorage.getItem('azure_user_role') || 'ADMIN';
    if (userRole === 'RECEPTIONIST') {
      alert('عذراً، لا يمتلك موظف الاستقبال صلاحية حذف الفواتير أو الحسابات المعتمدة.');
      return;
    }

    setConfirmAction({
      message: 'هل تريد حذف هذه الفاتورة وسجلات مدفوعاتها نهائياً من قاعدة البيانات؟ لا يمكن استرجاع الفاتورة المحذوفة.',
      onConfirm: () => {
        deleteInvoice(invoiceId);
        if (activeInvoice?.id === invoiceId) setActiveInvoice(null);
        refreshData();
        recalculatePatientBalances();
        triggerRefresh();
      }
    });
  };

  // Filter List
  const filteredInvoices = invoices.filter(inv => {
    const query = search.toLowerCase();
    const patient = patients.find(p => p.id === inv.patientId);
    const matchesSearch = 
      inv.id.toLowerCase().includes(query) || 
      inv.patientId.toLowerCase().includes(query) ||
      (patient && patient.name.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Control panel and search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ابحث برقم الفاتورة أو اسم المريض..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none"
          />
          <User className="absolute right-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل حالات الفواتير</option>
            <option value="Sent">مرسلة معلقة</option>
            <option value="Paid">مدفوعة بالكامل ✓</option>
            <option value="Partially Paid">مدفوعة جزئياً</option>
            <option value="Draft">مسودة</option>
            <option value="Overdue">متأخرة</option>
            <option value="Cancelled">ملغاة</option>
          </select>

          <button
            onClick={refreshData}
            className="p-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-sky-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار فاتورة جديدة</span>
          </button>
        </div>
      </div>

      {/* Invoice Generator Form */}
      {showAddForm && (
        <form onSubmit={handleCreateInvoice} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-500" />
            <span>معالج إنشاء الفاتورة الطبية الرقمية بالعيادة</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">اختر المريض المستفيد *</label>
              <select
                required
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="">-- اختر مريضاً --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ الاستحقاق النهائي</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">الخصم المباشر (ج.م)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-rose-600"
                min="0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">نسبة ضريبة المبيعات / القيمة المضافة (%)</label>
              <input
                type="number"
                value={tax}
                onChange={(e) => setTax(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-amber-600"
                min="0"
                max="100"
              />
            </div>
          </div>

          {/* Items Generator Segment */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/80 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 border-b border-slate-100 pb-1.5">بنود الفاتورة والعلاجات المقدمة</h4>
            
            {/* dynamic item adder */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
              <div className="md:col-span-6">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">وصف البند / العلاج</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="مثال: حشو ضوئي ألماني تجميلي للضرس رقم 19"
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">الكمية</label>
                <input
                  type="number"
                  value={newQty}
                  onChange={(e) => setNewQty(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-mono text-center"
                  min="1"
                />
              </div>

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold text-slate-400 mb-1">سعر الوحدة (ج.م)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-xs font-mono text-center font-bold text-emerald-600"
                  min="0"
                />
              </div>

              <div className="md:col-span-1">
                <button
                  type="button"
                  onClick={handleAddItemToForm}
                  className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-lg text-xs text-center cursor-pointer"
                >
                  أضف
                </button>
              </div>
            </div>

            {/* list added items */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {items.map((item, idx) => (
                <div key={item.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 text-xs">
                  <div className="font-bold text-slate-800">#{idx + 1} - {item.description}</div>
                  <div className="flex items-center gap-4 font-mono font-bold">
                    <span className="text-slate-400">الكمية: {item.quantity}</span>
                    <span className="text-emerald-700">السعر: {item.unitPrice} ج.م</span>
                    <span className="text-indigo-600">الإجمالي: {item.unitPrice * item.quantity} ج.م</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemFromForm(item.id)}
                      className="text-red-500 hover:text-red-700 p-0.5"
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              إلغاء الفاتورة
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
            >
              حفظ وتثبيت الفاتورة الرقمية ✓
            </button>
          </div>
        </form>
      )}

      {/* Main split dashboard list */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Invoices Directory */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col max-h-[500px]">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-50 pb-2">سجلات فواتير ومقبوضات العيادة ({filteredInvoices.length})</h3>
          
          <div className="overflow-y-auto pr-1 flex-grow space-y-2">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">لا توجد فواتير تطابق شروط البحث.</div>
            ) : (
              filteredInvoices.map(inv => {
                const patient = patients.find(p => p.id === inv.patientId);
                const isPaid = inv.status === 'Paid';
                const isCancelled = inv.status === 'Cancelled';
                
                return (
                  <div
                    key={inv.id}
                    onClick={() => {
                      setActiveInvoice(inv);
                      setPayingInvoiceId(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                      activeInvoice?.id === inv.id 
                        ? 'bg-sky-50/50 border-sky-300 shadow-sm' 
                        : 'bg-white hover:bg-slate-50 border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-800 text-xs sm:text-sm leading-none flex items-center gap-1.5">
                          <span>{inv.id}</span>
                          <span className={`text-[8px] px-1.5 py-0.5 rounded font-black ${
                            isPaid ? 'bg-emerald-100 text-emerald-700' :
                            isCancelled ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.status === 'Paid' ? 'مدفوعة كاملة' :
                             inv.status === 'Cancelled' ? 'ملغاة' : 'مرسلة معلقة'}
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">للمريض: {patient?.name || inv.patientId} ({inv.date})</span>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className="text-xs text-emerald-700 font-bold block">
                        إجمالي: {inv.totalAmount} ج.م
                      </span>
                      {inv.totalAmount - inv.paidAmount > 0 && (
                        <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md block mt-1">
                          متبقٍ: {inv.totalAmount - inv.paidAmount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Invoice Visual Inspection */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          {activeInvoice ? (
            <div className="space-y-6">
              {/* invoice details view */}
              <div className="border border-slate-200 p-5 rounded-2xl space-y-4 bg-slate-50/50 shadow-inner">
                <div className="flex justify-between items-center border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="font-black text-slate-900 text-base">{activeInvoice.id}</h4>
                    <p className="text-[10px] text-slate-400 mt-1">تاريخ الإصدار: {activeInvoice.date}</p>
                  </div>
                  <div className="text-left">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                      activeInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                      activeInvoice.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {activeInvoice.status === 'Paid' ? 'مدفوعة كاملة ✓' :
                       activeInvoice.status === 'Cancelled' ? 'ملغاة ملغاة' : 'قيد التحصيل المعلق'}
                    </span>
                  </div>
                </div>

                {/* Patient detail in invoice */}
                <div className="text-xs text-slate-600 space-y-1">
                  <p>العميل المستفيد: <strong className="text-slate-900">{(patients.find(p => p.id === activeInvoice.patientId))?.name || activeInvoice.patientId}</strong></p>
                  <p>تاريخ الاستحقاق النهائي: <strong className="text-slate-900 font-mono">{activeInvoice.dueDate}</strong></p>
                </div>

                {/* list items */}
                <div className="border-t border-b border-slate-200 py-3 text-xs space-y-2">
                  <h5 className="font-bold text-slate-400">البنود والعلاجات المسجلة بالفاتورة</h5>
                  {activeInvoice.items.map((item, idx) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-700">
                      <span>{idx + 1} - {item.description} (x{item.quantity})</span>
                      <span className="font-mono font-bold text-slate-900">{item.unitPrice * item.quantity} ج.م</span>
                    </div>
                  ))}
                </div>

                {/* breakdown */}
                <div className="text-xs font-mono space-y-1.5 text-slate-600">
                  <div className="flex justify-between">
                    <span>الخصومات الإدارية:</span>
                    <span className="text-rose-600 font-bold">-{activeInvoice.discount} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span>نسبة الضريبة (قيمة مضافة):</span>
                    <span className="text-amber-600 font-bold">+{activeInvoice.tax}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1.5 text-sm font-black text-emerald-700">
                    <span>القيمة الإجمالية المطلوبة:</span>
                    <span>{activeInvoice.totalAmount} ج.م</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>إجمالي المبالغ المدفوعة والمحصّلة:</span>
                    <span className="text-indigo-600">{activeInvoice.paidAmount} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Action and Payments logged */}
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {activeInvoice.status !== 'Paid' && activeInvoice.status !== 'Cancelled' && (
                    <button
                      onClick={() => {
                        setPayingInvoiceId(activeInvoice.id);
                        setPayAmount(activeInvoice.totalAmount - activeInvoice.paidAmount);
                      }}
                      className="flex-grow px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
                    >
                      تسجيل دفعة سداد جديدة
                    </button>
                  )}

                  {activeInvoice.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleCancelInvoice(activeInvoice.id)}
                      className="px-3 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Ban className="w-4 h-4" />
                      <span>إلغاء الفاتورة</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteInvoiceCompletely(activeInvoice.id)}
                    className="p-2 hover:bg-red-100 text-red-500 border border-slate-100 rounded-xl"
                    title="حذف الفاتورة بالكامل من السجل"
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* capture payment form */}
                {payingInvoiceId === activeInvoice.id && (
                  <form onSubmit={handleRecordPayment} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-3 text-xs">
                    <h5 className="font-bold text-emerald-800">إثبات وسداد مقبوضات العميل</h5>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">المبلغ المحصّل (ج.م)</label>
                        <input
                          type="number"
                          required
                          value={payAmount}
                          onChange={(e) => setPayAmount(Number(e.target.value))}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-mono font-bold text-emerald-700 text-center"
                          max={activeInvoice.totalAmount - activeInvoice.paidAmount}
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-1">طريقة السداد</label>
                        <select
                          value={payMethod}
                          onChange={(e: any) => setPayMethod(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs font-bold text-slate-600"
                        >
                          <option value="Cash">كاش / نقدي</option>
                          <option value="Card">فيزا / كارت بنكي</option>
                          <option value="InstaPay">انستا باي / InstaPay</option>
                          <option value="Insurance">بموجب التأمين</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">ملاحظات التحصيل (رقم الحوالة، اسم المستلم...)</label>
                      <input
                        type="text"
                        value={payNotes}
                        onChange={(e) => setPayNotes(e.target.value)}
                        placeholder="اختياري..."
                        className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-xl text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-1.5">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                      >
                        تثبيت السداد ✓
                      </button>
                      <button
                        type="button"
                        onClick={() => setPayingInvoiceId(null)}
                        className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg"
                      >
                        إلغاء
                      </button>
                    </div>
                  </form>
                )}

                {/* list payments recorded */}
                <div className="space-y-2">
                  <h5 className="font-black text-xs text-slate-400 uppercase tracking-wider">سجل المدفوعات المسددة لهذه الفاتورة ({activeInvoice.payments.length})</h5>
                  {activeInvoice.payments.length === 0 ? (
                    <p className="text-[10px] text-slate-400">لا توجد مدفوعات مسجلة بعد على هذه الفاتورة.</p>
                  ) : (
                    activeInvoice.payments.map((p, pidx) => (
                      <div key={p.id} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                        <div>
                          <strong className="text-slate-800">تحصيل دفعة #{pidx + 1}</strong>
                          <span className="text-[10px] text-slate-400 block font-mono">{p.date} | طريقة: {p.method}</span>
                          {p.notes && <span className="text-[9px] text-indigo-500 block italic">"{p.notes}"</span>}
                        </div>
                        <strong className="text-emerald-700 font-mono">{p.amount} ج.م</strong>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400">
              <Printer className="w-16 h-16 text-slate-100 mb-4 animate-pulse" />
              <h3 className="font-bold text-sm text-slate-700">لم يتم اختيار أي فاتورة للمعاينة</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">يرجى الضغط على أي فاتورة من قائمة الفواتير المقابلة لمعاينة تفاصيلها، إثبات وتحصيل الدفعات، وطباعة تفاصيلها.</p>
            </div>
          )}
        </div>

      </div>

      {confirmAction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 text-right animate-scale-up">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-800 text-center mb-2">تأكيد الإجراء ⚠️</h3>
            <p className="text-slate-600 text-xs text-center mb-6 leading-relaxed">
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
