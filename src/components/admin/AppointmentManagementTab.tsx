import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, Clock, User, CheckSquare, Plus, RefreshCw, Search, Filter, 
  Trash2, Edit, AlertCircle, CheckCircle, MapPin, DollarSign, List, Grid, ChevronLeft, ChevronRight 
} from 'lucide-react';
import { AdminAppointment, AppointmentStatus, ExtendedPatient, AdminDoctor } from '../../adminTypes';
import { getAppointments, saveAppointments, getPatients, getDoctors, recalculatePatientBalances, addNotification, getMonthLocks, deleteAppointment } from '../../clinicDb';

interface AppointmentManagementTabProps {
  triggerRefresh: () => void;
}

export default function AppointmentManagementTab({ triggerRefresh }: AppointmentManagementTabProps) {
  const [appointments, setAppointments] = useState<AdminAppointment[]>(() => getAppointments());
  const [patients] = useState<ExtendedPatient[]>(() => getPatients());
  const [doctors] = useState<AdminDoctor[]>(() => getDoctors());

  // Helper to check if a date falls in a locked month
  const isDateLocked = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const month = dateStr.slice(0, 7); // YYYY-MM
    const locks = getMonthLocks() || [];
    return locks.includes(month);
  };

  // Navigation and view states
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [activeSubTab, setActiveSubTab] = useState<'regular' | 'online'>('regular');
  const [search, setSearch] = useState('');
  const [doctorFilter, setDoctorFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Edit Appointment States
  const [editingApp, setEditingApp] = useState<AdminAppointment | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editDoctorEmail, setEditDoctorEmail] = useState('');
  const [editChairId, setEditChairId] = useState<'Chair 1' | 'Chair 2' | 'Chair 3'>('Chair 1');
  const [editDuration, setEditDuration] = useState(30);
  const [editVisitType, setEditVisitType] = useState<'Consultation' | 'Treatment' | 'FollowUp' | 'Emergency'>('Consultation');
  const [editFee, setEditFee] = useState(200);
  const [editNotes, setEditNotes] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState<'Cash' | 'Card' | 'InstaPay' | 'Insurance'>('Cash');

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Phone number formatter for Egypt mobile to WhatsApp integration
  const formatWhatsAppPhone = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('00')) {
      cleaned = cleaned.substring(2);
    }
    if (cleaned.startsWith('01') && cleaned.length === 11) {
      cleaned = '2' + cleaned;
    }
    return cleaned || phone;
  };

  const sendWhatsAppMessage = (phone: string, text: string) => {
    const formattedPhone = formatWhatsAppPhone(phone);
    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const startEditing = (app: AdminAppointment) => {
    setEditingApp(app);
    setEditDate(app.date);
    setEditTime(app.time);
    setEditDoctorEmail(app.doctorEmail);
    setEditChairId(app.chairId);
    setEditDuration(app.duration);
    setEditVisitType(app.visitType);
    setEditFee(app.consultationFee);
    setEditNotes(app.notes || '');
    setEditPaymentMethod(app.paymentMethod);
  };

  // New Booking State
  const [showAddForm, setShowAddForm] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [doctorEmail, setDoctorEmail] = useState('amr.eladawy@gmail.com');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('14:00');
  const [duration, setDuration] = useState(30);
  const [visitType, setVisitType] = useState<'Consultation' | 'Treatment' | 'FollowUp' | 'Emergency'>('Consultation');
  const [chairId, setChairId] = useState<'Chair 1' | 'Chair 2' | 'Chair 3'>('Chair 1');
  const [consultationFee, setConsultationFee] = useState(200);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'InstaPay' | 'Insurance'>('Cash');
  const [notes, setNotes] = useState('');

  // Calendar States
  const [currentDate, setCurrentDate] = useState(new Date());

  const refreshData = () => {
    setAppointments(getAppointments());
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) {
      alert('يرجى اختيار مريض مسجل أولاً.');
      return;
    }

    if (isDateLocked(date)) {
      alert('عذراً، هذا الشهر مقفل محاسبياً. لا يمكن حجز مواعيد في فترة مقفلة.');
      return;
    }

    const selectedPatient = patients.find(p => p.id === patientId);
    const selectedDoctor = doctors.find(d => d.email === doctorEmail);

    if (!selectedPatient || !selectedDoctor) {
      alert('البيانات المحددة غير صحيحة.');
      return;
    }

    const newApp: AdminAppointment = {
      id: 'APP-' + Math.floor(100000 + Math.random() * 900000).toString(),
      patientId,
      patientName: selectedPatient.name,
      patientPhone: selectedPatient.phone,
      doctorEmail,
      doctorName: selectedDoctor.name,
      date,
      time,
      duration: Number(duration),
      visitType,
      chairId,
      consultationFee: Number(consultationFee),
      paymentMethod,
      status: 'Scheduled',
      notes,
      createdAt: new Date().toISOString()
    };

    const list = getAppointments();
    list.unshift(newApp);
    saveAppointments(list);

    // Add notification
    addNotification(
      'Appointments',
      'Medium',
      `حجز جديد: ${selectedPatient.name}`,
      `تم حجز موعد جديد (${visitType}) مع ${selectedDoctor.name} بتاريخ ${date} الساعة ${time}.`,
      patientId
    );

    // Reset Form
    setPatientId('');
    setNotes('');
    setShowAddForm(false);
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  const handleUpdateStatus = (appId: string, newStatus: AppointmentStatus) => {
    const list = getAppointments();
    const appToCheck = list.find(item => item.id === appId);
    if (appToCheck && isDateLocked(appToCheck.date)) {
      alert('عذراً، لا يمكن تعديل حالة مواعيد تتبع لفترة محاسبية مقفلة.');
      return;
    }

    const updated = list.map(app => {
      if (app.id === appId) {
        // Trigger notification on change
        if (newStatus === 'Completed') {
          addNotification(
            'Payments',
            'Low',
            `موعد مكتمل: ${app.patientName}`,
            `تم اكتمال موعد المريض وتسجيل رسوم الكشف بقيمة ${app.consultationFee} ج.م بنجاح.`,
            app.patientId
          );
        }
        return { ...app, status: newStatus };
      }
      return app;
    });
    saveAppointments(updated);
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();
  };

  const handleDeleteAppointment = (appId: string) => {
    const list = getAppointments();
    const appToCheck = list.find(item => item.id === appId);
    if (appToCheck && isDateLocked(appToCheck.date)) {
      alert('عذراً، لا يمكن حذف مواعيد تتبع لفترة محاسبية مقفلة.');
      return;
    }

    const userRole = sessionStorage.getItem('azure_user_role') || 'ADMIN';
    if (userRole === 'RECEPTIONIST') {
      alert('عذراً، لا يمتلك موظف الاستقبال صلاحية حذف الحجوزات.');
      return;
    }

    setConfirmAction({
      message: 'هل أنت متأكد من حذف هذا الحجز بالكامل؟ لا يمكن التراجع عن هذا الإجراء وسيتم تعديل أرصدة المريض وتحديث السجلات فوراً.',
      onConfirm: () => {
        deleteAppointment(appId);
        refreshData();
        recalculatePatientBalances();
        triggerRefresh();
      }
    });
  };

  const handleApproveOnlineBooking = (app: AdminAppointment) => {
    if (isDateLocked(app.date)) {
      alert('عذراً، لا يمكن تعديل طلبات حجز تتبع لفترة محاسبية مقفلة.');
      return;
    }

    const list = getAppointments();
    const updated = list.map(item => {
      if (item.id === app.id) {
        return { ...item, status: 'Confirmed' as AppointmentStatus };
      }
      return item;
    });
    saveAppointments(updated);

    // Also update in website patient bookings (azure_bookings)
    const existingWeb = localStorage.getItem('azure_bookings');
    if (existingWeb) {
      try {
        const webBookings = JSON.parse(existingWeb) as any[];
        const webUpdated = webBookings.map((b: any) => {
          if (b.id === app.id) {
            return { ...b, status: 'confirmed' };
          }
          return b;
        });
        localStorage.setItem('azure_bookings', JSON.stringify(webUpdated));
      } catch (e) {
        console.error(e);
      }
    }

    addNotification(
      'Appointments',
      'Medium',
      `تمت الموافقة على الحجز: ${app.patientName}`,
      `تم تأكيد حجز المريض أونلاين لموعد يوم ${app.date} الساعة ${app.time}.`,
      app.patientId
    );

    refreshData();
    recalculatePatientBalances();
    triggerRefresh();

    const message = `مرحباً ${app.patientName}، تم تأكيد حجزك بنجاح في عيادة أزور لطب الأسنان 🦷.
الموعد: يوم ${app.date} الساعة ${app.time} مع دكتور ${app.doctorName}.
بانتظار تشريفكم لنا!`;
    sendWhatsAppMessage(app.patientPhone, message);
  };

  const handleRejectOnlineBooking = (app: AdminAppointment) => {
    if (isDateLocked(app.date)) {
      alert('عذراً، لا يمكن تعديل طلبات حجز تتبع لفترة محاسبية مقفلة.');
      return;
    }

    setConfirmAction({
      message: `هل أنت متأكد من رفض وإلغاء حجز المريض ${app.patientName}؟ سيتم إلغاء الحجز وتحديث حالة الموعد إلى ملغي فوراً.`,
      onConfirm: () => {
        const list = getAppointments();
        const updated = list.map(item => {
          if (item.id === app.id) {
            return { ...item, status: 'Cancelled' as AppointmentStatus };
          }
          return item;
        });
        saveAppointments(updated);

        // Also update in website patient bookings (azure_bookings)
        const existingWeb = localStorage.getItem('azure_bookings');
        if (existingWeb) {
          try {
            const webBookings = JSON.parse(existingWeb) as any[];
            const webUpdated = webBookings.map((b: any) => {
              if (b.id === app.id) {
                return { ...b, status: 'cancelled' };
              }
              return b;
            });
            localStorage.setItem('azure_bookings', JSON.stringify(webUpdated));
          } catch (e) {
            console.error(e);
          }
        }

        addNotification(
          'Appointments',
          'Low',
          `تم رفض وإلغاء الحجز أونلاين: ${app.patientName}`,
          `تم إلغاء طلب الموعد أونلاين للمريض يوم ${app.date} الساعة ${app.time}.`,
          app.patientId
        );

        refreshData();
        recalculatePatientBalances();
        triggerRefresh();

        const message = `مرحباً ${app.patientName}، نعتذر منك بشدة، لم نتمكن من قبول حجزك المقترح في عيادة أزور لطب الأسنان يوم ${app.date} الساعة ${app.time} نظراً لعدم توفر موعد شاغر. يرجى اختيار موعد آخر عبر موقعنا أو التواصل معنا لتنسيق موعد بديل.`;
        sendWhatsAppMessage(app.patientPhone, message);
      }
    });
  };

  const handleSaveEditedAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    if (isDateLocked(editingApp.date) || isDateLocked(editDate)) {
      alert('عذراً، لا يمكن تعديل مواعيد تتبع لفترة محاسبية مقفلة.');
      return;
    }

    const selectedDoctor = doctors.find(d => d.email === editDoctorEmail);
    if (!selectedDoctor) {
      alert('البيانات المحددة غير صحيحة.');
      return;
    }

    const isDateOrTimeOrDocChanged = editingApp.date !== editDate || editingApp.time !== editTime || editingApp.doctorEmail !== editDoctorEmail;

    const updatedApp: AdminAppointment = {
      ...editingApp,
      date: editDate,
      time: editTime,
      doctorEmail: editDoctorEmail,
      doctorName: selectedDoctor.name,
      chairId: editChairId,
      duration: Number(editDuration),
      visitType: editVisitType,
      consultationFee: Number(editFee),
      notes: editNotes,
      paymentMethod: editPaymentMethod,
      status: editingApp.isOnline ? 'Confirmed' : editingApp.status
    };

    const list = getAppointments();
    const idx = list.findIndex(app => app.id === editingApp.id);
    if (idx !== -1) {
      list[idx] = updatedApp;
      saveAppointments(list);
    }

    // Also update in website patient bookings (azure_bookings)
    const existingWeb = localStorage.getItem('azure_bookings');
    if (existingWeb) {
      try {
        const webBookings = JSON.parse(existingWeb) as any[];
        const webUpdated = webBookings.map((b: any) => {
          if (b.id === editingApp.id) {
            return {
              ...b,
              date: editDate,
              time: editTime,
              doctor: selectedDoctor.name,
              service: editNotes || 'تحديث الموعد من الإدارة',
              status: editingApp.isOnline ? 'confirmed' : b.status
            };
          }
          return b;
        });
        localStorage.setItem('azure_bookings', JSON.stringify(webUpdated));
      } catch (e) {
        console.error(e);
      }
    }

    addNotification(
      'Appointments',
      'Medium',
      `تحديث موعد: ${updatedApp.patientName}`,
      `تم تعديل تفاصيل الموعد بنجاح.`,
      updatedApp.patientId
    );

    setEditingApp(null);
    refreshData();
    recalculatePatientBalances();
    triggerRefresh();

    // Send WhatsApp
    if (editingApp.isOnline && isDateOrTimeOrDocChanged) {
      const message = `مرحباً ${updatedApp.patientName}، بخصوص طلب حجزك في عيادة أزور لطب الأسنان 🦷، يقترح الطبيب تعديل الموعد ليكون يوم ${editDate} الساعة ${editTime} مع دكتور ${selectedDoctor.name}. هل هذا الموعد مناسب لك؟`;
      sendWhatsAppMessage(updatedApp.patientPhone, message);
    } else if (editingApp.isOnline) {
      const message = `مرحباً ${updatedApp.patientName}، تم تأكيد حجزك المعدل في عيادة أزور لطب الأسنان 🦷. الموعد الجديد: يوم ${editDate} الساعة ${editTime} مع دكتور ${selectedDoctor.name}. بانتظاركم!`;
      sendWhatsAppMessage(updatedApp.patientPhone, message);
    }
  };

  // Filter List
  const filteredAppointments = appointments.filter(app => {
    const query = search.toLowerCase();
    const matchesSearch = 
      app.patientName.toLowerCase().includes(query) || 
      app.patientPhone.includes(query) || 
      app.id.toLowerCase().includes(query);

    const matchesDoctor = doctorFilter === 'all' || app.doctorEmail === doctorFilter;
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;

    // Filter by activeSubTab (pending online requests go to the Online sub-tab)
    const matchesSubTab = activeSubTab === 'online'
      ? (app.isOnline && app.status === 'Scheduled')
      : !(app.isOnline && app.status === 'Scheduled');

    return matchesSearch && matchesDoctor && matchesStatus && matchesSubTab;
  });

  const pendingOnlineCount = appointments.filter(app => app.isOnline && app.status === 'Scheduled').length;

  // Calendar Helpers
  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Generate Calendar Days
  const calendarDays = () => {
    const totalDays = daysInMonth(currentDate);
    const startDay = firstDayOfMonth(currentDate); // 0 (Sun) to 6 (Sat)
    
    // Arabic adjustment (if we want Saturday to be start, or keep default)
    // We will align days of week. Standard calendar starts with Sunday.
    const days: (Date | null)[] = Array(startDay).fill(null);
    for (let d = 1; d <= totalDays; d++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), d));
    }
    return days;
  };

  const monthNames = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  return (
    <div className="space-y-6" dir="rtl">

      {/* Sub-tabs Header */}
      <div className="flex border-b border-slate-100 pb-1">
        <button
          onClick={() => {
            setActiveSubTab('regular');
            setEditingApp(null);
          }}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'regular'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>جدول المواعيد المجدولة 🗓️</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('online');
            setEditingApp(null);
          }}
          className={`pb-3 px-6 text-xs font-black transition-all border-b-2 flex items-center gap-2 cursor-pointer relative ${
            activeSubTab === 'online'
              ? 'border-sky-500 text-sky-600'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>طلبات الحجوزات الأونلاين 🌐</span>
            {pendingOnlineCount > 0 && (
              <span className="bg-rose-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5 animate-pulse">
                {pendingOnlineCount} جديد
              </span>
            )}
          </span>
        </button>
      </div>

      {/* Edit Appointment Form */}
      {editingApp && (
        <form onSubmit={handleSaveEditedAppointment} className="bg-white p-6 rounded-3xl border border-sky-200 shadow-md space-y-4">
          <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Edit className="w-5 h-5 text-sky-500" />
            <span>تعديل وحفظ بيانات حجز المريض: {editingApp.patientName}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">المريض</label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700">
                {editingApp.patientName} ({editingApp.patientPhone})
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">تعيين الطبيب المعالج *</label>
              <select
                value={editDoctorEmail}
                onChange={(e) => setEditDoctorEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.email}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">التاريخ *</label>
              <input
                type="date"
                required
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ساعة الحجز *</label>
              <input
                type="time"
                required
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">المدة المقدرة</label>
              <select
                value={editDuration}
                onChange={(e) => setEditDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="15">15 دقيقة</option>
                <option value="30">30 دقيقة</option>
                <option value="45">45 دقيقة</option>
                <option value="60">60 دقيقة</option>
                <option value="90">90 دقيقة</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">نوع الزيارة العلاجية</label>
              <select
                value={editVisitType}
                onChange={(e: any) => setEditVisitType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Consultation">استشارة وكشف كلاسيكي</option>
                <option value="Treatment">جلسة علاج وتنظيف</option>
                <option value="FollowUp">متابعة دورية مجانية</option>
                <option value="Emergency">حالة طوارئ عاجلة</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم كرسي الأسنان</label>
              <select
                value={editChairId}
                onChange={(e: any) => setEditChairId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Chair 1">كرسي رقم 1</option>
                <option value="Chair 2">كرسي رقم 2</option>
                <option value="Chair 3">كرسي رقم 3</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">رسوم الكشف (ج.م)</label>
              <input
                type="number"
                value={editFee}
                onChange={(e) => setEditFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">طريقة الدفع المعتمدة</label>
              <select
                value={editPaymentMethod}
                onChange={(e: any) => setEditPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Cash">كاش / نقدي</option>
                <option value="Card">فيزا / كارت بنكي</option>
                <option value="InstaPay">انستا باي / InstaPay</option>
                <option value="Insurance">بموجب تغطية التأمين</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ملاحظات الطبيب / العيادة</label>
              <input
                type="text"
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="تفاصيل إضافية للحالة..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingApp(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
            >
              {editingApp.isOnline ? 'حفظ وتعديل الموعد وإرسال واتساب 💬' : 'حفظ تعديلات الحجز ✓'}
            </button>
          </div>
        </form>
      )}

      {/* Online Bookings Tab */}
      {activeSubTab === 'online' && !editingApp && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <h3 className="font-black text-xs sm:text-sm text-slate-800 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-indigo-500" />
              <span>طلبات الحجوزات الأونلاين المرسلة من المرضى عبر الموقع</span>
            </h3>

            <div className="flex gap-2 w-full md:w-auto justify-end">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث بالاسم أو الهاتف..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-9 pl-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none"
                />
                <Search className="absolute right-3 top-2 w-4 h-4 text-slate-400" />
              </div>

              <select
                value={doctorFilter}
                onChange={(e) => setDoctorFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
              >
                <option value="all">كل الأطباء المطلوبين</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.email}>{d.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold">
                    <th className="p-4">المريض وبياناته</th>
                    <th className="p-4">الموعد المطلوب</th>
                    <th className="p-4">الطبيب المقترح</th>
                    <th className="p-4">الخدمة / الملاحظات</th>
                    <th className="p-4 text-center">الإجراءات والقرارات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-slate-400 font-bold">
                        لا توجد طلبات حجوزات أونلاين معلقة حالياً. 🎉
                      </td>
                    </tr>
                  ) : (
                    filteredAppointments.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-slate-900">{app.patientName}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">{app.patientPhone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-slate-800 flex items-center gap-1">
                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                            <span>{app.date}</span>
                          </div>
                          <div className="text-[10px] text-sky-600 font-bold font-mono mt-0.5 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-sky-400" />
                            <span>{app.time}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-bold text-indigo-700">{app.doctorName}</div>
                        </td>
                        <td className="p-4">
                          <span className="bg-sky-50 text-sky-600 px-2 py-0.5 rounded text-[10px] font-bold">
                            حجز عبر الموقع 🌐
                          </span>
                          {app.notes && (
                            <p className="text-[10px] text-slate-400 mt-1 italic max-w-xs truncate" title={app.notes}>
                              "{app.notes}"
                            </p>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1.5 justify-center">
                            <button
                              onClick={() => handleApproveOnlineBooking(app)}
                              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="قبول وتأكيد الحجز وإرسال رسالة واتساب لتأكيد الموعد للمريض"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>موافقة وتأكيد الحجز ✓</span>
                            </button>

                            <button
                              onClick={() => startEditing(app)}
                              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="تعديل تفاصيل الموعد واقتراح موعد بديل وإرسال واتساب"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>تعديل واقتراح موعد 📝</span>
                            </button>

                            <button
                              onClick={() => handleRejectOnlineBooking(app)}
                              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                              title="رفض الطلب وإلغائه وإرسال اعتذار للمريض واتساب"
                            >
                              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                              <span>رفض وإلغاء ❌</span>
                            </button>
                          </div>
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

      {/* Regular Schedule Tab */}
      {activeSubTab === 'regular' && !editingApp && (
        <>
          {/* Search and control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Toggle View Mode Buttons */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'list' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <List className="w-4 h-4" />
            <span>قائمة الجدولة</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'calendar' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            <span>التقويم الشهري 📅</span>
          </button>
        </div>

        {/* Filter and Search controls */}
        {viewMode === 'list' && (
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
            <div className="relative">
              <input
                type="text"
                placeholder="ابحث بالاسم أو الهاتف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pr-9 pl-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none"
              />
              <Search className="absolute right-3 top-2 w-4 h-4 text-slate-400" />
            </div>

            <select
              value={doctorFilter}
              onChange={(e) => setDoctorFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="all">كل الأطباء</option>
              {doctors.map(d => (
                <option key={d.id} value={d.email}>{d.name}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
            >
              <option value="all">كل حالات الحجز</option>
              <option value="Scheduled">مجدول</option>
              <option value="Confirmed">مؤكد</option>
              <option value="Completed">مكتمل ✓</option>
              <option value="Cancelled">ملغي</option>
              <option value="No Show">لم يحضر</option>
            </select>
          </div>
        )}

        <div className="flex gap-2 w-full md:w-auto justify-end">
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
            <span>حجز موعد جديد</span>
          </button>
        </div>
      </div>

      {/* Booking Manual Form */}
      {showAddForm && (
        <form onSubmit={handleCreateAppointment} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-sky-500" />
            <span>تسجيل وحجز موعد يدوي جديد للمريض</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">اختر المريض المسجل *</label>
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="">-- اختر مريضاً من الدليل --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">تعيين الطبيب المعالج *</label>
              <select
                value={doctorEmail}
                onChange={(e) => setDoctorEmail(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                {doctors.map(d => (
                  <option key={d.id} value={d.email}>{d.name} ({d.specialty})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">التاريخ المالي *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ساعة الحجز *</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">المدة المقدرة (بالدقائق)</label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="15">15 دقيقة</option>
                <option value="30">30 دقيقة</option>
                <option value="45">45 دقيقة</option>
                <option value="60">60 دقيقة (ساعة كاملة)</option>
                <option value="90">90 دقيقة</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">نوع الزيارة العلاجية</label>
              <select
                value={visitType}
                onChange={(e: any) => setVisitType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Consultation">استشارة وكشف كلاسيكي</option>
                <option value="Treatment">جلسة علاج وتنظيف</option>
                <option value="FollowUp">متابعة دورية مجانية</option>
                <option value="Emergency">حالة طوارئ عاجلة</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم كرسي الأسنان</label>
              <select
                value={chairId}
                onChange={(e: any) => setChairId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Chair 1">كرسي رقم 1 (رئيسي)</option>
                <option value="Chair 2">كرسي رقم 2 (تجميلي)</option>
                <option value="Chair 3">كرسي رقم 3 (جراحي)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">رسوم الكشف / الاستشارة (ج.م)</label>
              <input
                type="number"
                value={consultationFee}
                onChange={(e) => setConsultationFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-emerald-600"
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">طريقة الدفع المعتمدة</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Cash">كاش / نقدي</option>
                <option value="Card">فيزا / كارت بنكي</option>
                <option value="InstaPay">انستا باي / InstaPay</option>
                <option value="Insurance">بموجب تغطية التأمين</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">ملاحظات الطبيب / العيادة</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="تفاصيل إضافية للحالة أو متطلبات الجلسة القادمة..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              إلغاء الحجز
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
            >
              تأكيد وتسجيل الحجز الإداري ✓
            </button>
          </div>
        </form>
      )}

      {/* Main Render Area */}
      {viewMode === 'list' ? (
        /* List view */
        <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold">
                  <th className="p-4">المعرف / المريض</th>
                  <th className="p-4">تاريخ الموعد والساعة</th>
                  <th className="p-4">الطبيب والكرسي</th>
                  <th className="p-4">نوع الخدمة والمدة</th>
                  <th className="p-4">الرسوم والدفع</th>
                  <th className="p-4">حالة الحجز</th>
                  <th className="p-4 text-center">التحكم والعمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-xs">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">لا توجد مواعيد علاجية مجدولة مسجلة حالياً.</td>
                  </tr>
                ) : (
                  filteredAppointments.map(app => (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{app.patientName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{app.id} | {app.patientPhone}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.date}</span>
                        </div>
                        <div className="text-[10px] text-sky-600 font-bold font-mono mt-0.5 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-sky-400" />
                          <span>{app.time} ({app.duration} دقيقة)</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-indigo-700">{app.doctorName}</div>
                        <div className="text-[10px] text-slate-400 font-bold mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.chairId}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          app.visitType === 'Emergency' ? 'bg-rose-50 text-rose-600' :
                          app.visitType === 'Treatment' ? 'bg-indigo-50 text-indigo-600' :
                          app.visitType === 'Consultation' ? 'bg-sky-50 text-sky-600' : 'bg-slate-50 text-slate-600'
                        }`}>
                          {app.visitType === 'Emergency' ? 'طوارئ عاجلة 🚨' :
                           app.visitType === 'Treatment' ? 'جلسة علاجية' :
                           app.visitType === 'Consultation' ? 'كشف واستشارة' : 'متابعة دورية'}
                        </span>
                        {app.notes && <p className="text-[10px] text-slate-400 mt-1 italic max-w-xs truncate" title={app.notes}>"{app.notes}"</p>}
                      </td>
                      <td className="p-4">
                        <strong className="text-emerald-700 font-mono text-sm">{app.consultationFee} ج.م</strong>
                        <div className="text-[10px] text-slate-400 mt-0.5">بواسطة: {app.paymentMethod}</div>
                      </td>
                      <td className="p-4">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value as AppointmentStatus)}
                          className={`px-2 py-1 bg-slate-50 rounded-lg text-[10px] font-bold border cursor-pointer focus:outline-none ${
                            app.status === 'Completed' ? 'border-emerald-200 text-emerald-700 bg-emerald-50/50' :
                            app.status === 'Confirmed' ? 'border-sky-200 text-sky-700 bg-sky-50' :
                            app.status === 'No Show' ? 'border-amber-200 text-amber-700 bg-amber-50' :
                            app.status === 'Cancelled' ? 'border-red-200 text-red-700 bg-red-50' : 'border-slate-200 text-slate-600'
                          }`}
                        >
                          <option value="Scheduled">مجدول</option>
                          <option value="Confirmed">مؤكد</option>
                          <option value="Completed">مكتمل ✓</option>
                          <option value="Cancelled">ملغي</option>
                          <option value="No Show">لم يحضر</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex gap-1 justify-center">
                          <button
                            onClick={() => startEditing(app)}
                            className="p-1.5 hover:bg-sky-50 text-sky-500 rounded-lg transition-colors cursor-pointer"
                            title="تعديل تفاصيل الحجز"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteAppointment(app.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحجز نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Calendar view */
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
          
          {/* Month Navigator Header */}
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-indigo-500" />
              <span>أجندة مواعيد العيادة: {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
            </h3>

            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-[10px] font-black bg-white text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                اليوم
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 bg-white text-slate-700 rounded-lg hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 pb-2">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
              <div key={day} className="py-1 bg-slate-50 rounded-lg text-slate-600">{day}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays().map((day, index) => {
              if (day === null) {
                return <div key={index} className="aspect-square bg-slate-50/20 rounded-2xl border border-transparent" />;
              }

              const dayString = day.toISOString().slice(0, 10);
              const dayAppointments = appointments.filter(app => app.date === dayString && !(app.isOnline && app.status === 'Scheduled'));

              const isToday = new Date().toISOString().slice(0, 10) === dayString;

              return (
                <div 
                  key={index} 
                  className={`aspect-square p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                    isToday 
                      ? 'border-indigo-400 bg-indigo-50/20' 
                      : 'border-slate-100 hover:border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-black font-mono w-5 h-5 rounded-full flex items-center justify-center ${
                      isToday ? 'bg-indigo-500 text-white' : 'text-slate-800'
                    }`}>
                      {day.getDate()}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-[9px] bg-sky-500 text-white font-black rounded-full px-1.5 py-0.5 leading-none">
                        {dayAppointments.length} حجز
                      </span>
                    )}
                  </div>

                  {/* List of micro appointments */}
                  <div className="mt-1 space-y-1 flex-grow overflow-y-auto max-h-16 text-right" dir="rtl">
                    {dayAppointments.slice(0, 2).map(app => (
                      <div 
                        key={app.id} 
                        className={`text-[8px] p-1 rounded font-bold truncate ${
                          app.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-r border-emerald-500' :
                          app.status === 'Confirmed' ? 'bg-sky-50 text-sky-700 border-r border-sky-500' : 'bg-slate-50 text-slate-700 border-r border-slate-400'
                        }`}
                        title={`${app.patientName} - ${app.time}`}
                      >
                        {app.time} | {app.patientName}
                      </div>
                    ))}
                    {dayAppointments.length > 2 && (
                      <div className="text-[7px] text-slate-400 text-center font-bold">+{dayAppointments.length - 2} آخرين</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

        </>
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
