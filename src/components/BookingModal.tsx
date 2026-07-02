import React, { useState } from 'react';
import { apiFetch as fetch } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, ChevronRight, ChevronLeft, Calendar, Clock, User, 
  Phone, CheckCircle2, MessageSquare, AlertCircle, Sparkles, 
  ShieldCheck, Smile, HelpCircle
} from 'lucide-react';
import { SERVICES, DOCTORS, CLINIC_CONTACT } from '../data';
import { Appointment } from '../types';
import { getPatients, savePatients, getAppointments, saveAppointments, getDoctors } from '../clinicDb';
import { ExtendedPatient, AdminAppointment } from '../adminTypes';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: (appointment: Appointment) => void;
  initialServiceId?: string;
}

export default function BookingModal({ isOpen, onClose, onBookingSuccess, initialServiceId }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [service, setService] = useState(initialServiceId || SERVICES[0].id);
  const [doctor, setDoctor] = useState(DOCTORS[0].id);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Appointment | null>(null);

  // Prefill details if a patient is logged in
  React.useEffect(() => {
    const activePatientStr = localStorage.getItem('azure_active_patient');
    if (activePatientStr) {
      try {
        const patient = JSON.parse(activePatientStr);
        if (patient) {
          setName(patient.name || '');
          setPhone(patient.phone || '');
        }
      } catch (err) {
        console.error('Error pre-populating patient data', err);
      }
    }
  }, [isOpen]);

  // Available times (2:00 PM - 10:00 PM)
  const availableTimes = [
    { value: '02:30', label: '2:30 مساءً' },
    { value: '03:30', label: '3:30 مساءً' },
    { value: '04:30', label: '4:30 مساءً' },
    { value: '05:30', label: '5:30 مساءً' },
    { value: '06:30', label: '6:30 مساءً' },
    { value: '07:30', label: '7:30 مساءً' },
    { value: '08:30', label: '8:30 مساءً' },
    { value: '09:30', label: '9:30 مساءً' },
  ];

  const handleNext = () => {
    if (step === 1) {
      if (!service) {
        setError('يرجى اختيار الخدمة المطلوبة أولاً');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!doctor) {
        setError('يرجى اختيار الطبيب المعالج');
        return;
      }
      setError('');
      setStep(3);
    } else if (step === 3) {
      if (!date) {
        setError('يرجى تحديد تاريخ الزيارة');
        return;
      }
      if (!time) {
        setError('يرجى اختيار التوقيت المفضل');
        return;
      }
      // Check if selected date is Friday
      const selectedDay = new Date(date).getDay();
      if (selectedDay === 5) { // Friday
        setError('العيادة مغلقة أيام الجمعة، يرجى اختيار يوم آخر');
        return;
      }
      setError('');
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError('');
      setStep(step - 1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('يرجى إدخال الاسم بالكامل');
      return;
    }
    if (!phone.trim() || phone.length < 11) {
      setError('يرجى إدخال رقم هاتف صحيح (11 رقم على الأقل)');
      return;
    }

    const selectedService = SERVICES.find(s => s.id === service);
    const selectedDoctor = DOCTORS.find(d => d.id === doctor);
    const doctorNameAr = selectedDoctor ? selectedDoctor.nameAr : 'د. عمرو العدوي';
    const timeLabel = availableTimes.find(t => t.value === time)?.label || time;

    // Read active patient ID if any
    let activePatientId: string | undefined = undefined;
    const activePatientStr = localStorage.getItem('azure_active_patient');
    if (activePatientStr) {
      try {
        const patient = JSON.parse(activePatientStr);
        activePatientId = patient?.id;
      } catch (err) {
        console.error(err);
      }
    }

    // Try to sync with full-stack server
    let finalApptId = 'AZ-' + Math.floor(100000 + Math.random() * 900000);
    let finalPatientId = activePatientId || ('PAT-' + Math.floor(100000 + Math.random() * 900000));
    let isSuccessfulSync = false;

    try {
      const res = await fetch("/api/public/book", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          email: activePatientStr ? JSON.parse(activePatientStr).email : null,
          service: selectedService ? selectedService.titleAr : 'كشف واستشارة عامة',
          doctor: doctorNameAr,
          date,
          time: timeLabel,
          notes: notes.trim() || undefined,
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.appointment) {
          finalApptId = data.appointment.id;
          finalPatientId = data.appointment.patientId;
          isSuccessfulSync = true;
        }
      }
    } catch (err) {
      console.error("Failed to connect to backend for real-time booking:", err);
    }

    if (!isSuccessfulSync) {
      setError("تعذر إتمام الحجز، يرجى المحاولة لاحقًا أو الاتصال بالعيادة.");
      return;
    }

    const newAppointment: Appointment = {
      id: finalApptId,
      patientId: finalPatientId,
      name: name.trim(),
      phone: phone.trim(),
      service: selectedService ? selectedService.titleAr : 'كشف واستشارة عامة',
      doctor: doctorNameAr,
      date,
      time: timeLabel,
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Save to local storage for the marketing site's "My Bookings"
    const existing = localStorage.getItem('azure_bookings');
    const bookings = existing ? JSON.parse(existing) : [];
    bookings.push(newAppointment);
    localStorage.setItem('azure_bookings', JSON.stringify(bookings));

    // If API failed, keep local client db updated to handle sync when network becomes available
    if (!isSuccessfulSync) {
      try {
        // 1. Check if patient exists in admin database by phone
        const adminPatients = getPatients() || [];
        let adminPatient = adminPatients.find(p => p && p.phone === phone.trim());
        if (!adminPatient) {
          // Create a new patient in admin database
          adminPatient = {
            id: finalPatientId,
            name: name.trim(),
            phone: phone.trim(),
            email: 'patient@dentalflow.pro',
            bloodType: 'O+',
            emergencyContact: {
              name: 'غير محدد',
              phone: 'غير محدد',
              relation: 'غير محدد'
            },
            medicalConditions: [],
            allergies: [],
            insurance: {
              provider: 'لا يوجد تأمين',
              policyNumber: '',
              discountPercent: 0
            },
            photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
            isActive: true,
            totalSpent: 0,
            outstandingBalance: 0,
            createdAt: new Date().toISOString()
          };
          adminPatients.unshift(adminPatient);
          savePatients(adminPatients);
        }

        // 2. Add as AdminAppointment
        const adminApps = getAppointments() || [];
        
        // Find doctor email if possible
        const doctorsList = getDoctors() || [];
        const docObj = doctorsList.find(d => d && d.name === doctorNameAr);
        const docEmail = docObj ? docObj.email : 'amr.eladawy@gmail.com';

        const newAdminApp: AdminAppointment = {
          id: finalApptId, // match the exact same ID so they are synced!
          patientId: adminPatient.id,
          patientName: name.trim(),
          patientPhone: phone.trim(),
          doctorEmail: docEmail,
          doctorName: doctorNameAr,
          date,
          time: timeLabel,
          duration: 30, // default
          visitType: 'Consultation', // default for online bookings
          chairId: 'Chair 1',
          consultationFee: 200, // standard
          paymentMethod: 'Cash',
          status: 'Scheduled', // Scheduled is the default state representing "mjdol" (pending approval)
          notes: notes.trim() || 'حجز عبر الموقع الإلكتروني',
          isOnline: true,
          createdAt: new Date().toISOString()
        };
        adminApps.unshift(newAdminApp);
        saveAppointments(adminApps);
      } catch (e) {
        console.error('Error syncing online booking to admin db', e);
      }
    }

    setConfirmedBooking(newAppointment);
    onBookingSuccess(newAppointment);
    setStep(5); // Show success ticket step
  };

  const handleWhatsAppConfirm = () => {
    if (!confirmedBooking) return;
    const text = `السلام عليكم ورحمة الله وبركاته،
أود تأكيد موعد حجز في عيادة أزور لطب الأسنان (Azure Dental Clinic):

• كود الحجز: *${confirmedBooking.id}*
• الاسم: *${confirmedBooking.name}*
• الجوال: *${confirmedBooking.phone}*
• التخصص: *${confirmedBooking.service}*
• الطبيب: *${confirmedBooking.doctor}*
• التاريخ: *${confirmedBooking.date}*
• الوقت: *${confirmedBooking.time}*
${confirmedBooking.notes ? `• ملاحظات إضافية: ${confirmedBooking.notes}` : ''}

شكراً لكم، أرجو تأكيد موعد الزيارة.`;

    const encodedText = encodeURIComponent(text);
    const whatsappUrl = `https://wa.me/${CLINIC_CONTACT.whatsapp}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    // Reset modal
    setStep(1);
    setService(initialServiceId || SERVICES[0].id);
    setDoctor(DOCTORS[0].id);
    setDate('');
    setTime('');
    setName('');
    setPhone('');
    setNotes('');
    setError('');
    setConfirmedBooking(null);
    onClose();
  };

  const selectedServiceObj = SERVICES.find(s => s.id === service);
  const selectedDoctorObj = DOCTORS.find(d => d.id === doctor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        id="booking-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', duration: 0.5 }}
        className="relative w-full max-w-2xl bg-white/95 backdrop-blur-xl border border-slate-100 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]"
      >
        {/* Glow effect */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="relative p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-950 flex items-center gap-2">
              <span className="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>
              {step === 5 ? 'تم تسجيل طلب حجزك بنجاح!' : 'حجز موعد استشارة وتجميل'}
            </h3>
            {step < 5 && (
              <p className="text-sm text-slate-500 mt-1 font-mono">
                الخطوة {step} من 4 • {step === 1 && 'اختر الخدمة العلاجية'}
                {step === 2 && 'اختر الطبيب المعالج'}
                {step === 3 && 'تحديد الموعد'}
                {step === 4 && 'معلومات الاتصال'}
              </p>
            )}
          </div>
          <button 
            id="close-booking-modal-btn"
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body - Scrollable content */}
        <div className="p-6 overflow-y-auto flex-1 relative" dir="rtl">
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 font-medium"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Select Service */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <h4 className="text-base font-semibold text-slate-800 mb-2">اختر الخدمة أو التخصص المطلوب:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICES.map((s) => {
                    const isSelected = service === s.id;
                    return (
                      <button
                        id={`btn-service-${s.id}`}
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setService(s.id);
                          setError('');
                        }}
                        className={`text-right p-4 rounded-2xl border-2 transition-all flex flex-col justify-between h-full relative group ${
                          isSelected 
                            ? 'border-sky-500 bg-sky-50/50 shadow-md shadow-sky-100' 
                            : 'border-slate-100 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between w-full">
                          <span className={`p-2.5 rounded-xl ${
                            isSelected ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          } transition-colors`}>
                            <Sparkles className="w-5 h-5" />
                          </span>
                          {isSelected && (
                            <span className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-white">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                        <div className="mt-4">
                          <h5 className="font-bold text-slate-900 text-base">{s.titleAr}</h5>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{s.descAr}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Select Doctor */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <h4 className="text-base font-semibold text-slate-800 mb-2">اختر الطبيب المفضل أو الاستشاري:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {DOCTORS.map((d) => {
                    const isSelected = doctor === d.id;
                    return (
                      <button
                        id={`btn-doctor-${d.id}`}
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setDoctor(d.id);
                          setError('');
                        }}
                        className={`text-right p-4 rounded-2xl border-2 transition-all flex items-start gap-4 ${
                          isSelected 
                            ? 'border-sky-500 bg-sky-50/40 shadow-md shadow-sky-100' 
                            : 'border-slate-100 hover:border-slate-200 bg-white'
                        }`}
                      >
                        {/* Profile Photo */}
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-50 border border-slate-100">
                          {d.image.startsWith('http') ? (
                            <img src={d.image} alt={d.nameAr} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            // Placeholder style for custom doctors
                            <div className="w-full h-full bg-gradient-to-tr from-sky-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl">
                              {d.nameAr.charAt(3)}
                            </div>
                          )}
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-slate-900 text-base">{d.nameAr}</h5>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-sky-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-sky-600 mt-0.5">{d.roleAr}</p>
                          <p className="text-[11px] text-slate-400 mt-1 font-mono">{d.experience}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500 flex gap-2.5 items-start mt-4">
                  <ShieldCheck className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    جميع أطبائنا استشاريين وأعضاء بهيئة الأطباء المتخصصة في مستشفى ميت غمر العام والمراكز التعليمية، بخبرات ممتدة تضمن لك أعلى معايير الجودة الطبية والتعقيم.
                  </p>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Date & Time Picker */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Calendar Input Column */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-sky-500" />
                      تاريخ الزيارة المفضل:
                    </label>
                    <input 
                      id="booking-date-input"
                      type="date" 
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setError('');
                      }}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100/50 text-slate-900 text-right transition-all font-mono"
                    />
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      * يرجى ملاحظة أن العيادة مغلقة تماماً أيام الجمعة للاستراحة والتعقيم الشامل. ساعات العمل اليومية تبدأ من الساعة 2:00 ظهراً وحتى 10:00 مساءً.
                    </p>
                  </div>

                  {/* Time slots Column */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-sky-500" />
                      التوقيت المفضل:
                    </label>
                    <div className="grid grid-cols-2 gap-2 max-h-[220px] overflow-y-auto p-1">
                      {availableTimes.map((t) => {
                        const isSelected = time === t.value;
                        return (
                          <button
                            id={`btn-time-slot-${t.value}`}
                            key={t.value}
                            type="button"
                            onClick={() => {
                              setTime(t.value);
                              setError('');
                            }}
                            className={`p-3 text-xs font-medium rounded-xl border text-center transition-all font-sans ${
                              isSelected 
                                ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-100' 
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            {t.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Name, Phone, Notes Form */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <User className="w-4 h-4 text-sky-500" />
                      الاسم الثلاثي بالكامل:
                    </label>
                    <input 
                      id="booking-name-input"
                      type="text"
                      placeholder="مثال: أحمد محمد كمال"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100/50 text-slate-900 text-right transition-all"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-sky-500" />
                      رقم الجوال (المرتبط بالواتساب):
                    </label>
                    <input 
                      id="booking-phone-input"
                      type="tel"
                      placeholder="مثال: 01039591109"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100/50 text-slate-900 text-left transition-all font-mono"
                      dir="ltr"
                    />
                  </div>

                  {/* Notes Input */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-sky-500" />
                      ملاحظات أو أعراض تشتكي منها (اختياري):
                    </label>
                    <textarea 
                      id="booking-notes-input"
                      rows={3}
                      placeholder="اكتب هنا باختصار إذا كان هناك ألم مستمر، رغبة في زراعة، تجميل، أو ميعاد طارئ..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full p-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-100/50 text-slate-900 text-right transition-all resize-none"
                    />
                  </div>

                  {/* Summary recap bar */}
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>التخصص: <strong className="text-slate-900">{selectedServiceObj?.titleAr}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>الطبيب: <strong className="text-slate-900">{selectedDoctorObj?.nameAr}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500"></span>
                      <span>الموعد: <strong className="text-slate-900 font-mono">{date}</strong> في <strong className="text-slate-900 font-mono">{availableTimes.find(t => t.value === time)?.label}</strong></span>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}

            {/* STEP 5: Success & Premium WhatsApp Confirmation Ticket */}
            {step === 5 && confirmedBooking && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center space-y-6"
              >
                {/* Visual success seal */}
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center relative shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                  <motion.div 
                    className="absolute inset-0 border-2 border-emerald-500 rounded-full"
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </div>

                <div className="space-y-2">
                  <h4 className="text-2xl font-bold text-slate-900">حجزك المبدئي قيد المراجعة!</h4>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                    لقد قمنا بتسجيل بيانات الحجز الخاص بك في نظام العيادة. لضمان حجز الموعد وتأكيده فوراً لدى الطبيب المعالج، يرجى النقر على الزر لتأكيد حجزك وإرساله لخدمة الاستقبال في العيادة عبر واتساب.
                  </p>
                </div>

                {/* Digital Ticket */}
                <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden font-sans">
                  {/* Cutout circles on sides */}
                  <div className="absolute top-1/2 -left-3 w-6 h-6 bg-white border-r border-slate-800 rounded-full transform -translate-y-1/2 z-10" />
                  <div className="absolute top-1/2 -right-3 w-6 h-6 bg-white border-l border-slate-800 rounded-full transform -translate-y-1/2 z-10" />
                  
                  {/* Decorative glowing lines */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/20 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl" />

                  {/* Ticket Header */}
                  <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-800">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">Azure Dental Clinic</span>
                      <h5 className="text-sm font-bold text-white mt-0.5">تذكرة تأكيد الموعد</h5>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-mono">رقم الحجز</span>
                      <p className="text-sm font-bold text-sky-400 font-mono mt-0.5">{confirmedBooking.id}</p>
                    </div>
                  </div>

                  {/* Ticket details */}
                  <div className="py-4 space-y-3 text-right">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400">الاسم</span>
                        <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">{confirmedBooking.name}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">الجوال</span>
                        <p className="text-xs font-bold text-slate-200 mt-0.5 font-mono">{confirmedBooking.phone}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400">الخدمة المطلوب</span>
                        <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">{confirmedBooking.service}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">الطبيب المعالج</span>
                        <p className="text-xs font-bold text-slate-200 mt-0.5 truncate">{confirmedBooking.doctor}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900">
                      <div>
                        <span className="text-[10px] text-slate-400">تاريخ الزيارة</span>
                        <p className="text-xs font-bold text-sky-400 mt-0.5 font-mono">{confirmedBooking.date}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400">الوقت المختار</span>
                        <p className="text-xs font-bold text-sky-400 mt-0.5">{confirmedBooking.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* QR mimic footer */}
                  <div className="pt-3 border-t border-dashed border-slate-800 flex items-center justify-between text-left">
                    <div className="flex gap-1 items-center text-[10px] text-slate-500">
                      <Smile className="w-3.5 h-3.5 text-sky-500" />
                      <span>ابتسامتك المشرقة تبدأ هنا</span>
                    </div>
                    <div className="h-6 w-24 bg-gradient-to-r from-sky-500/10 to-blue-500/10 rounded border border-slate-800/40 flex items-center justify-center font-mono text-[9px] text-slate-400">
                      SECURE TICKET
                    </div>
                  </div>
                </div>

                <div className="w-full flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    id="whatsapp-confirm-btn"
                    onClick={handleWhatsAppConfirm}
                    className="flex-1 p-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-md shadow-emerald-900/10 flex items-center justify-center gap-2 hover:translate-y-[-1px]"
                  >
                    <MessageSquare className="w-5 h-5 shrink-0" />
                    <span>تأكيد الحجز الفوري عبر واتساب</span>
                  </button>
                  <button
                    id="save-close-btn"
                    onClick={handleClose}
                    className="p-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>إغلاق وحفظ</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Modal Footer Controls */}
        {step < 5 && (
          <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between" dir="rtl">
            <div className="flex gap-2">
              <button
                id="modal-next-btn"
                type="button"
                onClick={step === 4 ? handleSubmit : handleNext}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-sky-500/10"
              >
                <span>{step === 4 ? 'تأكيد وحفظ الموعد' : 'التالي'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>

              {step > 1 && (
                <button
                  id="modal-back-btn"
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold rounded-xl transition-all flex items-center gap-1"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>الرجوع</span>
                </button>
              )}
            </div>

            {/* Step Indicators */}
            <div className="flex gap-1.5 items-center">
              {[1, 2, 3, 4].map((s) => (
                <span 
                  key={s} 
                  className={`h-1.5 rounded-full transition-all ${
                    step === s ? 'w-6 bg-sky-500' : 'w-1.5 bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
