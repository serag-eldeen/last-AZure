import React, { useState, useEffect } from 'react';
import { 
  Plus, Check, CheckSquare, ShieldCheck, DollarSign, RefreshCw, Calendar, Eye, 
  Trash2, User, FileText, ListTodo, AlertCircle, Sparkles, Smile, MessageSquare 
} from 'lucide-react';
import { TreatmentPlan, TreatmentSession, ToothCondition, ExtendedPatient } from '../../adminTypes';
import { getPatients, getTreatments, saveTreatments, completeTreatmentSession, recalculatePatientBalances, addNotification, deleteTreatment, getInvoices, saveInvoices } from '../../clinicDb';

interface TreatmentPlanTabProps {
  initialPatientId?: string;
  triggerRefresh: () => void;
}

export default function TreatmentPlanTab({ initialPatientId, triggerRefresh }: TreatmentPlanTabProps) {
  const [patients] = useState<ExtendedPatient[]>(() => getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [treatments, setTreatments] = useState<TreatmentPlan[]>([]);

  // Form states - Create Treatment Plan
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalCost, setTotalCost] = useState(1500);
  const [paidAmount, setPaidAmount] = useState(0);

  // Session form inside plan creation
  const [sessionCount, setSessionCount] = useState(1);
  const [sessions, setSessions] = useState<{
    id: string;
    notes: string;
    affectedTeeth: string; // comma separated
    toothCondition: ToothCondition;
  }[]>([
    { id: '1', notes: 'الجلسة الأولى: تنظيف وإعداد كلي للسن', affectedTeeth: '14', toothCondition: 'Filling' }
  ]);

  // Payment update state
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null);
  const [paymentInput, setPaymentInput] = useState(0);

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  useEffect(() => {
    if (selectedPatientId) {
      setTreatments(getTreatments().filter(t => t.patientId === selectedPatientId));
    } else {
      setTreatments([]);
    }
  }, [selectedPatientId]);

  const refreshData = () => {
    if (selectedPatientId) {
      setTreatments(getTreatments().filter(t => t.patientId === selectedPatientId));
    }
  };

  const handleSessionChange = (index: number, field: string, value: string) => {
    const updated = [...sessions];
    updated[index] = { ...updated[index], [field]: value };
    setSessions(updated);
  };

  const handleAddSessionRow = () => {
    setSessions([
      ...sessions,
      { 
        id: (sessions.length + 1).toString(), 
        notes: `الجلسة رقم ${sessions.length + 1}: إجراء مكمل للسن`, 
        affectedTeeth: '', 
        toothCondition: 'Filling' 
      }
    ]);
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) {
      alert('يرجى اختيار مريض أولاً.');
      return;
    }

    if (!title.trim()) {
      alert('الرجاء إدخال عنوان خطة العلاج.');
      return;
    }

    // Build formal treatment sessions
    const parsedSessions: TreatmentSession[] = sessions.map((s, idx) => ({
      id: 'SES-' + Math.floor(100000 + Math.random() * 900000).toString(),
      date: new Date(Date.now() + idx * 7 * 24 * 3600 * 1000).toISOString().slice(0, 10), // weekly spacing estimation
      notes: s.notes,
      completed: false,
      affectedTeeth: s.affectedTeeth.split(',').map(n => Number(n.trim())).filter(n => !isNaN(n) && n > 0),
      toothCondition: s.toothCondition
    }));

    const newPlan: TreatmentPlan = {
      id: 'TRT-' + Math.floor(100000 + Math.random() * 900000).toString(),
      patientId: selectedPatientId,
      title: title.trim(),
      description: description.trim(),
      status: 'Planned',
      sessions: parsedSessions,
      totalCost: Number(totalCost),
      paidAmount: Number(paidAmount),
      createdAt: new Date().toISOString()
    };

    const list = getTreatments();
    list.unshift(newPlan);
    saveTreatments(list);

    // Automatically create an Invoice representing this treatment plan
    const currentInvoices = getInvoices();
    const count = currentInvoices.length;
    const invNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().slice(0, 10);
    
    const invoicePayments = [];
    if (Number(paidAmount) > 0) {
      invoicePayments.push({
        id: 'PAY-' + Math.floor(100000 + Math.random() * 900000).toString(),
        date: today,
        amount: Number(paidAmount),
        method: 'Cash' as const,
        notes: `دفعة مقدمة محصلة عند إنشاء خطة العلاج: ${newPlan.title}`
      });
    }

    const newInvoice = {
      id: invNumber,
      patientId: selectedPatientId,
      treatmentPlanId: newPlan.id,
      date: today,
      dueDate: today,
      items: [
        {
          id: 'ITM-' + Math.floor(100000 + Math.random() * 900000).toString(),
          description: `خطة علاج: ${newPlan.title}`,
          quantity: 1,
          unitPrice: Number(totalCost)
        }
      ],
      discount: 0,
      tax: 0,
      status: (Number(paidAmount) >= Number(totalCost) ? 'Paid' : (Number(paidAmount) > 0 ? 'Partially Paid' : 'Sent')) as any,
      payments: invoicePayments,
      totalAmount: Number(totalCost),
      paidAmount: Number(paidAmount),
      createdAt: new Date().toISOString()
    };
    
    currentInvoices.unshift(newInvoice);
    saveInvoices(currentInvoices);

    // Add notification
    const selPat = patients.find(p => p.id === selectedPatientId);
    addNotification(
      'Treatments',
      'Medium',
      `خطة علاج جديدة: ${selPat?.name}`,
      `تم إعداد خطة علاج "${title.trim()}" بإجمالي تكلفة ${totalCost} ج.م ومقسمة على ${sessions.length} جلسة.`,
      selectedPatientId
    );

    // Reset Form
    setTitle('');
    setDescription('');
    setTotalCost(1500);
    setPaidAmount(0);
    setSessions([{ id: '1', notes: 'الجلسة الأولى: تنظيف وإعداد كلي للسن', affectedTeeth: '14', toothCondition: 'Filling' }]);
    setShowAddForm(false);
    
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  // Complete a Session and automatically update dental chart!
  const handleCompleteSession = (planId: string, sessionId: string) => {
    completeTreatmentSession(planId, sessionId, selectedPatientId);
    refreshData();
    triggerRefresh();
  };

  const handleUpdatePayment = (planId: string) => {
    const list = getTreatments();
    let targetPlan: TreatmentPlan | null = null;
    const updated = list.map(plan => {
      if (plan.id === planId) {
        targetPlan = plan;
        const newPaid = plan.paidAmount + Number(paymentInput);
        const finalPaid = newPaid > plan.totalCost ? plan.totalCost : newPaid;
        return {
          ...plan,
          paidAmount: finalPaid
        };
      }
      return plan;
    });

    if (targetPlan) {
      const plan: TreatmentPlan = targetPlan;
      const amountPaidThisTime = Number(paymentInput);
      const newPlanPaid = plan.paidAmount + amountPaidThisTime;
      const finalPlanPaid = newPlanPaid > plan.totalCost ? plan.totalCost : newPlanPaid;

      const currentInvoices = getInvoices();
      const invoice = currentInvoices.find(inv => inv.treatmentPlanId === planId);
      const today = new Date().toISOString().slice(0, 10);

      if (invoice) {
        // Update existing invoice
        const paymentId = 'PAY-' + Math.floor(100000 + Math.random() * 900000).toString();
        invoice.payments.push({
          id: paymentId,
          date: today,
          amount: amountPaidThisTime,
          method: 'Cash',
          notes: `دفعة إضافية محصلة من خطة العلاج: ${plan.title}`
        });
        invoice.paidAmount = finalPlanPaid;
        invoice.status = finalPlanPaid >= invoice.totalAmount ? 'Paid' : 'Partially Paid';
      } else {
        // Create a new invoice for legacy plan
        const count = currentInvoices.length;
        const invNumber = `INV-2026-${String(count + 1).padStart(4, '0')}`;
        
        const invoicePayments = [];
        if (finalPlanPaid > 0) {
          invoicePayments.push({
            id: 'PAY-' + Math.floor(100000 + Math.random() * 900000).toString(),
            date: today,
            amount: amountPaidThisTime,
            method: 'Cash' as const,
            notes: `دفعة محصلة من خطة العلاج: ${plan.title}`
          });
        }

        const newInvoice = {
          id: invNumber,
          patientId: selectedPatientId,
          treatmentPlanId: planId,
          date: today,
          dueDate: today,
          items: [
            {
              id: 'ITM-' + Math.floor(100000 + Math.random() * 900000).toString(),
              description: `خطة علاج: ${plan.title}`,
              quantity: 1,
              unitPrice: plan.totalCost
            }
          ],
          discount: 0,
          tax: 0,
          status: (finalPlanPaid >= plan.totalCost ? 'Paid' : (finalPlanPaid > 0 ? 'Partially Paid' : 'Sent')) as any,
          payments: invoicePayments,
          totalAmount: plan.totalCost,
          paidAmount: finalPlanPaid,
          createdAt: new Date().toISOString()
        };
        currentInvoices.unshift(newInvoice);
      }
      saveInvoices(currentInvoices);
    }

    saveTreatments(updated);
    setPayingPlanId(null);
    setPaymentInput(0);
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  const handleDeletePlan = (planId: string) => {
    setConfirmAction({
      message: 'هل أنت متأكد من حذف خطة العلاج وجلساتها بالكامل من النظام؟ لا يمكن التراجع عن هذا الإجراء وسيتم تعديل السجلات والتقارير فوراً.',
      onConfirm: () => {
        deleteTreatment(planId);
        refreshData();
        recalculatePatientBalances();
        triggerRefresh();
      }
    });
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Patient selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 shrink-0">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">اختر المريض لعرض وتتبع خطة العلاج</label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="">-- اختر مريضاً --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
              ))}
            </select>
          </div>
        </div>

        {selectedPatientId && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-teal-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة خطة علاجية جديدة</span>
          </button>
        )}
      </div>

      {/* Add Plan Form */}
      {showAddForm && (
        <form onSubmit={handleCreatePlan} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-500" />
            <span>صياغة خطة علاج وتتبع جلسات المريض</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] font-bold text-slate-500 mb-1">عنوان الخطة العلاجية *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="مثال: تركيب جسر تجميلي للأسنان العلوية الأمامية"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">وصف موجز لخطة العلاج</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="تفاصيل إضافية عن نوع المواد أو الجراحة..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">التكلفة الإجمالية للخطة (ج.م) *</label>
              <input
                type="number"
                required
                value={totalCost}
                onChange={(e) => setTotalCost(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-emerald-600"
                min="0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">المدفوع مقدماً من العميل (ج.م)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-indigo-600"
                min="0"
              />
            </div>
          </div>

          {/* Dynamic Sessions specification */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
              <h4 className="font-bold text-xs text-slate-700">تخطيط جلسات الخطة ومستهدف مخطط الأسنان</h4>
              <button
                type="button"
                onClick={handleAddSessionRow}
                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-[10px] font-bold"
              >
                + إضافة جلسة علاجية أخرى
              </button>
            </div>

            <div className="space-y-3 max-h-48 overflow-y-auto">
              {sessions.map((sess, idx) => (
                <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-slate-100">
                  <div className="md:col-span-1 font-mono text-[10px] font-black text-slate-400 text-center">جلسة #{idx + 1}</div>
                  
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      value={sess.notes}
                      onChange={(e) => handleSessionChange(idx, 'notes', e.target.value)}
                      placeholder="تفاصيل الإجراء والملاحظات..."
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-[11px]"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <input
                      type="text"
                      value={sess.affectedTeeth}
                      onChange={(e) => handleSessionChange(idx, 'affectedTeeth', e.target.value)}
                      placeholder="أرقام الأسنان (مثال: 14, 15)"
                      className="w-full px-3 py-1.5 bg-slate-50 rounded-lg text-[11px] font-mono"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <select
                      value={sess.toothCondition}
                      onChange={(e) => handleSessionChange(idx, 'toothCondition', e.target.value)}
                      className="w-full px-2 py-1.5 bg-slate-50 rounded-lg text-[11px] font-bold text-slate-600"
                    >
                      <option value="Healthy">سليم</option>
                      <option value="Cavity">تسوس</option>
                      <option value="Filling">حشو كومبوزيت</option>
                      <option value="Root Canal">حشو عصب</option>
                      <option value="Extraction">خلع</option>
                      <option value="Crown">تاج / كراون</option>
                      <option value="Bridge">جسر أسنان</option>
                      <option value="Implant">زراعة</option>
                      <option value="Orthodontics">تقويم</option>
                      <option value="Missing">مفقود</option>
                    </select>
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
              إلغاء الخطة
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold"
            >
              حفظ وتسجيل الخطة العلاجية ✓
            </button>
          </div>
        </form>
      )}

      {/* Plans List and details */}
      {selectedPatientId ? (
        <div className="space-y-4">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-2">الخطط العلاجية النشطة للمريض ({treatments.length})</h3>
          
          {treatments.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
              <Smile className="w-16 h-16 text-slate-100 mx-auto mb-4" />
              <h4 className="font-bold text-sm text-slate-700">لا توجد خطط علاجية نشطة بعد</h4>
              <p className="text-[11px] text-slate-400 mt-1">السن بحالة ممتازة! أو لم يتلق أي خطط علاج أو مقاسات تركيبات دورية بعد.</p>
            </div>
          ) : (
            treatments.map(plan => {
              const pendingAmount = plan.totalCost - plan.paidAmount;
              const percentPaid = Math.round((plan.paidAmount / plan.totalCost) * 100);

              return (
                <div key={plan.id} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
                  {/* Plan header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-50 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md font-bold">{plan.id}</span>
                        <h4 className="font-black text-slate-900 text-sm sm:text-base">{plan.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                        plan.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        plan.status === 'In Progress' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-50 text-slate-600'
                      }`}>
                        {plan.status === 'Completed' ? 'خطة مكتملة بالكامل ✓' :
                         plan.status === 'In Progress' ? 'قيد التنفيذ والمتابعة' : 'مجدولة إدارياً'}
                      </span>

                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                        title="حذف الخطة نهائياً"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial progress bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50/50 p-4 rounded-2xl border border-slate-100/40 text-xs">
                    <div>
                      <div className="flex justify-between font-bold text-slate-600 mb-1">
                        <span>التحصيل المالي</span>
                        <span className="font-mono text-emerald-600">{percentPaid}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full" style={{ width: `${percentPaid}%` }} />
                      </div>
                    </div>

                    <div className="text-center sm:text-right">
                      <span className="text-[10px] text-slate-400 block">تكلفة العلاج الإجمالية</span>
                      <strong className="text-base text-slate-800 font-mono">{plan.totalCost} ج.م</strong>
                    </div>

                    <div className="flex justify-between sm:justify-end items-center gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 block">المدفوع / المتبقي العالق</span>
                        <strong className="text-xs text-indigo-600 font-mono">{plan.paidAmount} ج.م</strong> / <strong className="text-xs text-rose-600 font-mono">{pendingAmount} ج.م</strong>
                      </div>

                      {pendingAmount > 0 && payingPlanId !== plan.id && (
                        <button
                          onClick={() => {
                            setPayingPlanId(plan.id);
                            setPaymentInput(pendingAmount);
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          تحصيل دفعة
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic payment input */}
                  {payingPlanId === plan.id && (
                    <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-800">تحصيل دفعة مالية بقيمة (ج.م):</span>
                        <input
                          type="number"
                          value={paymentInput}
                          onChange={(e) => setPaymentInput(Number(e.target.value))}
                          className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-mono font-bold text-emerald-700 w-24 text-center"
                          max={pendingAmount}
                          min="1"
                        />
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleUpdatePayment(plan.id)}
                          className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold"
                        >
                          تأكيد الدفع ✓
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayingPlanId(null)}
                          className="px-2.5 py-1 bg-slate-200 text-slate-600 rounded-lg"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sessions layout list */}
                  <div className="space-y-2">
                    <h5 className="font-black text-xs text-slate-500 uppercase tracking-wider">سجل جلسات خطة العلاج المجدولة ({plan.sessions.length})</h5>
                    
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {plan.sessions.map((sess, sidx) => (
                        <div 
                          key={sess.id} 
                          className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                            sess.completed 
                              ? 'bg-emerald-50/20 border-emerald-100' 
                              : 'bg-white border-slate-100 hover:border-slate-200'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">جلسة #{sidx + 1}</span>
                              <span className={`text-[9px] font-bold ${
                                sess.completed ? 'text-emerald-600' : 'text-amber-600'
                              }`}>
                                {sess.completed ? 'مكتملة ومثبتة بالمخطط ✓' : 'جلسة قادمة معلقة'}
                              </span>
                            </div>
                            <h6 className="font-bold text-slate-800 text-xs">{sess.notes}</h6>
                            <div className="text-[10px] text-slate-400 font-bold flex flex-wrap items-center gap-3">
                              <span>مستهدف الأسنان: <strong className="text-slate-700 font-mono">[{sess.affectedTeeth.join(', ')}]</strong></span>
                              <span>•</span>
                              <span>الإجراء: <strong className="text-indigo-600">{sess.toothCondition}</strong></span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {sess.completed ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-xl">
                                <ShieldCheck className="w-4 h-4" />
                                <span>تم الحفظ والمزامنة 🦷</span>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleCompleteSession(plan.id, sess.id)}
                                className="px-3.5 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm"
                              >
                                إتمام الجلسة ومزامنة الأسنان
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <FileText className="w-16 h-16 text-slate-100 mx-auto mb-4" />
          <h3 className="font-bold text-sm text-slate-700">دليل خطط علاج المرضى مغلق</h3>
          <p className="text-[11px] text-slate-400 mt-1">الرجاء اختيار مريض من الأعلى لعرض الخطط العلاجية الخاصة به، تتبع جلساته المتعددة، وتحصيل رسوم التكلفة المتبقية العالقة.</p>
        </div>
      )}

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
