import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Clock, User, Smile, Trash2, ExternalLink, 
  ShieldCheck, Heart, Lock, Mail, Phone, LogOut, FileText, 
  Plus, CheckCircle2, Info, Activity, AlertCircle
} from 'lucide-react';
import { Appointment, Patient } from '../types';
import { CLINIC_CONTACT, SERVICES, DOCTORS } from '../data';
import { getPatients, savePatients, getTreatments, getAppointments, initClinicDb } from '../clinicDb';
import { TreatmentPlan, ExtendedPatient } from '../adminTypes';
import { DollarSign, Coins } from 'lucide-react';

interface MyBookingsProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh: boolean;
  onOpenBooking?: () => void;
  onOpenAdmin?: () => void;
}

export default function MyBookings({ isOpen, onClose, triggerRefresh, onOpenBooking, onOpenAdmin }: MyBookingsProps) {
  const [activePatient, setActivePatient] = useState<Patient | null>(null);
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Appointments for the active patient
  const [myAppointments, setMyAppointments] = useState<Appointment[]>([]);

  // Patient Financial & Treatment Plans
  const [patientStats, setPatientStats] = useState<{
    totalSpent: number;
    outstandingBalance: number;
    treatmentPlans: TreatmentPlan[];
  } | null>(null);

  // Load active patient session and filter bookings
  useEffect(() => {
    // Seed initial patients if none exist
    const patientsStr = localStorage.getItem('azure_patients');
    if (!patientsStr) {
      const initialPatients: Patient[] = [
        {
          id: 'PAT-829402',
          name: 'سارة عبد الرحمن منصور',
          phone: '01039591109',
          email: 'sara@example.com',
          password: '123',
          createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
          medicalHistory: ['تنظيف جير تجميلي وجلسة فلورايد', 'حشوات تجميلية للضروس الخلفية'],
          caseStatus: 'نشط',
          clinicalNotes: 'المريضة تعاني من حساسية خفيفة باللثة. تم التوصية بمعجون أسنان مخصص وحضور جلسة المتابعة بعد أسبوعين.'
        },
        {
          id: 'PAT-402941',
          name: 'محمد علي البدري',
          phone: '01124567890',
          email: 'mohamed@example.com',
          password: '123',
          createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
          medicalHistory: ['تركيب مقاسات زراعة السن الأمامي السفلي', 'عمل أشعة مقطعية ثلاثية الأبعاد (CBCT)'],
          caseStatus: 'متابعة دورية',
          clinicalNotes: 'تم التحام عظم الفك ممتاز لزراعة الغرسة التيتانيوم. بانتظار جلسة التركيبة النهائية المات الخزفية.'
        }
      ];
      localStorage.setItem('azure_patients', JSON.stringify(initialPatients));
    }

    const activeSession = localStorage.getItem('azure_active_patient');
    if (activeSession && activeSession !== 'undefined' && activeSession !== 'null') {
      try {
        const patient = JSON.parse(activeSession) as Patient;
        if (!patient || !patient.id) {
          setActivePatient(null);
          return;
        }
        
        // Let's reload patient data from patient directory to ensure medical updates are synced!
        const patientsStr = localStorage.getItem('azure_patients');
        if (patientsStr) {
          const allPatients = JSON.parse(patientsStr) as Patient[];
          let freshData = allPatients.find(p => p && p.id === patient.id);
          
          // Let's check in the admin database
          const adminPatientsList = getPatients() || [];
          const matchedAdmin = adminPatientsList.find(p => p && (p.id === patient.id || (p.phone && p.phone === patient.phone)));
          
          if (matchedAdmin) {
            // Update freshData with latest info from admin clinical record
            const updatedFreshData: Patient = {
              id: matchedAdmin.id,
              name: matchedAdmin.name || patient.name || '',
              phone: matchedAdmin.phone || patient.phone || '',
              email: matchedAdmin.email || patient.email || '',
              password: matchedAdmin.password || patient.password || '',
              createdAt: matchedAdmin.createdAt || patient.createdAt || new Date().toISOString(),
              medicalHistory: matchedAdmin.medicalConditions && matchedAdmin.medicalConditions.length > 0
                ? matchedAdmin.medicalConditions
                : (freshData?.medicalHistory || ['تم ربط الملف الطبي الإلكتروني بنجاح ومزامنته']),
              caseStatus: matchedAdmin.isActive ? 'نشط' : 'غير نشط',
              clinicalNotes: freshData?.clinicalNotes || 'تم مزامنة ملفك بنجاح مع نظام العيادة الداخلي.'
            };
            
            if (freshData) {
              const idx = allPatients.findIndex(p => p && p.id === freshData!.id);
              if (idx !== -1) {
                allPatients[idx] = updatedFreshData;
              }
            } else {
              allPatients.push(updatedFreshData);
            }
            localStorage.setItem('azure_patients', JSON.stringify(allPatients));
            freshData = updatedFreshData;
          }

          if (freshData) {
            setActivePatient(freshData);
            localStorage.setItem('azure_active_patient', JSON.stringify(freshData));
          } else {
            setActivePatient(patient);
          }
        } else {
          setActivePatient(patient);
        }
      } catch (err) {
        console.error(err);
        setActivePatient(null);
      }
    } else {
      setActivePatient(null);
    }
  }, [isOpen, triggerRefresh]);

  // Sync patient bookings (merged with admin appointments)
  useEffect(() => {
    if (activePatient) {
      // 1. Get website bookings
      let webBookings: Appointment[] = [];
      const existingWeb = localStorage.getItem('azure_bookings');
      if (existingWeb) {
        try {
          webBookings = JSON.parse(existingWeb) as Appointment[];
        } catch (e) {
          console.error(e);
        }
      }

      // 2. Get admin appointments
      const adminApps = getAppointments();
      
      // Map admin appointments to Appointment structure
      const mappedAdminApps: Appointment[] = adminApps
        .filter(app => 
          (app.patientId === activePatient.id || app.patientPhone === activePatient.phone) &&
          app.status !== 'Cancelled' &&
          app.status !== 'No Show'
        )
        .map(app => ({
          id: app.id,
          name: app.patientName,
          phone: app.patientPhone,
          service: app.notes || app.doctorName || 'استشارة ومتابعة',
          date: app.date,
          time: app.time,
          status: (app.status === 'Confirmed' || app.status === 'Completed') ? 'confirmed' : 'pending',
          createdAt: app.createdAt || new Date(app.date).toISOString(),
          doctor: app.doctorName
        }));

      // Merge and filter unique by id
      const mergedMap = new Map<string, Appointment>();
      
      // Add web bookings first
      webBookings
        .filter(app => app.patientId === activePatient.id || app.phone === activePatient.phone)
        .forEach(app => mergedMap.set(app.id, app));

      // Add mapped admin apps
      mappedAdminApps.forEach(app => {
        mergedMap.set(app.id, app);
      });

      const merged = Array.from(mergedMap.values());
      merged.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
      
      setMyAppointments(merged);
    } else {
      setMyAppointments([]);
    }
  }, [activePatient, triggerRefresh]);

  // Sync financial and treatment plans
  useEffect(() => {
    if (activePatient) {
      const allPatients = getPatients();
      const currentPat = allPatients.find(p => p.id === activePatient.id || p.phone === activePatient.phone);
      
      const allTreatments = getTreatments();
      const patientTreatments = allTreatments.filter(t => t.patientId === activePatient.id || (currentPat && t.patientId === currentPat.id));
      
      if (currentPat) {
        setPatientStats({
          totalSpent: currentPat.totalSpent || 0,
          outstandingBalance: currentPat.outstandingBalance || 0,
          treatmentPlans: patientTreatments
        });
      } else {
        const paidAmount = patientTreatments.reduce((sum, t) => sum + (t.paidAmount || 0), 0);
        setPatientStats({
          totalSpent: paidAmount,
          outstandingBalance: 0,
          treatmentPlans: patientTreatments
        });
      }
    } else {
      setPatientStats(null);
    }
  }, [activePatient, triggerRefresh]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginPhoneOrEmail || !loginPassword) {
      setLoginError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const cleanInput = loginPhoneOrEmail.trim().toLowerCase();
    const cleanPassword = loginPassword.trim();

    try {
      fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ emailOrPhone: cleanInput, password: cleanPassword })
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          
          if (data.token) {
            sessionStorage.setItem('azure_access_token', data.token);
            localStorage.setItem('azure_access_token', data.token);
          }
          if (data.refreshToken) {
            sessionStorage.setItem('azure_refresh_token', data.refreshToken);
            localStorage.setItem('azure_refresh_token', data.refreshToken);
          }
          
          await initClinicDb(true);
          
          if (data.user && data.user.role && data.user.role !== "PATIENT") {
            // Log in as Admin/Staff
            sessionStorage.setItem('azure_admin_authenticated', 'true');
            sessionStorage.setItem('azure_user_role', data.user.role);
            sessionStorage.setItem('azure_user_name', data.user.name);
            sessionStorage.setItem('azure_user_email', data.user.email || '');
            
            setLoginPhoneOrEmail('');
            setLoginPassword('');
            
            if (onOpenAdmin) {
              onOpenAdmin();
            } else {
              onClose();
            }
            return;
          }
          
          // Clear any leftover admin session items when logging in as a patient
          sessionStorage.removeItem('azure_admin_authenticated');
          sessionStorage.removeItem('azure_user_role');
          sessionStorage.removeItem('azure_user_name');
          sessionStorage.removeItem('azure_user_email');

          const patientsList = getPatients();
          const found = patientsList.find(p => p.id === data.user.id) || {
            id: data.user.id,
            name: data.user.name,
            phone: cleanInput,
            email: data.user.email || "",
            password: cleanPassword,
            bloodType: 'O+',
            medicalConditions: [],
            allergies: [],
            insurance: { provider: '', policyNumber: '', discountPercent: 0 },
            isActive: true
          };
          setActivePatient(found as any);
          localStorage.setItem('azure_active_patient', JSON.stringify(found));
          setLoginPhoneOrEmail('');
          setLoginPassword('');
        } else {
          const errData = await res.json().catch(() => ({}));
          setLoginError(errData.error || 'بيانات الدخول غير صحيحة! يرجى التحقق من الهاتف/البريد وكلمة المرور.');
        }
      }).catch(() => {
        // Fallback for offline mode
        const patientsStr = localStorage.getItem('azure_patients');
        if (patientsStr) {
          const allPatients = JSON.parse(patientsStr) as Patient[];
          const found = allPatients.find(p => 
            (p.phone === loginPhoneOrEmail.trim() || p.email.toLowerCase() === loginPhoneOrEmail.trim().toLowerCase()) &&
            p.password === loginPassword
          );
          if (found) {
            setActivePatient(found);
            localStorage.setItem('azure_active_patient', JSON.stringify(found));
            setLoginPhoneOrEmail('');
            setLoginPassword('');
          } else {
            setLoginError('بيانات الدخول غير صحيحة! يرجى التحقق من الهاتف/البريد وكلمة المرور.');
          }
        } else {
          setLoginError('لا يوجد أي حسابات مسجلة بعد. قم بإنشاء حسابك الأول!');
        }
      });
    } catch (err) {
      setLoginError('حدث خطأ أثناء معالجة بيانات المصادقة.');
    }
  };

  // Handle Register with ERP linking & auto-sync
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim() || !regPhone.trim() || !regEmail.trim() || !regPassword) {
      setRegError('يرجى تعبئة كافة البيانات المطلوبة');
      return;
    }

    if (regPhone.trim().length < 11) {
      setRegError('يرجى إدخال رقم هاتف صحيح ومكتمل (11 رقم)');
      return;
    }

    const patientsStr = localStorage.getItem('azure_patients');
    let allPatients: Patient[] = [];
    
    if (patientsStr) {
      try {
        allPatients = JSON.parse(patientsStr) as Patient[];
      } catch (err) {
        console.error(err);
      }
    }

    // Load admin clinic patients
    const adminPatients = getPatients();
    const matchedAdminPatient = adminPatients.find(p => p.phone === regPhone.trim());

    // Check if duplicate online account already exists
    const onlineAccountExists = allPatients.some(p => p.phone === regPhone.trim());

    if (onlineAccountExists) {
      setRegError('رقم الهاتف هذا مسجل بالفعل وله حساب نشط! يرجى تسجيل الدخول بدلاً من ذلك.');
      return;
    }

    let newPatient: Patient;

    if (matchedAdminPatient) {
      // LINKING WITH ADMIN PROFILE!
      // This is an existing patient added by the admin, claiming their account now.
      newPatient = {
        id: matchedAdminPatient.id, // CRITICAL: Use the exact same ID from the clinical database!
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        createdAt: matchedAdminPatient.createdAt || new Date().toISOString(),
        medicalHistory: matchedAdminPatient.medicalConditions && matchedAdminPatient.medicalConditions.length > 0
          ? matchedAdminPatient.medicalConditions
          : ['تم ربط الملف الطبي الإلكتروني بنجاح ومزامنة البيانات مع العيادة'],
        caseStatus: matchedAdminPatient.isActive ? 'نشط' : 'تحت المعاينة والاستشارة',
        clinicalNotes: 'تم ربط حسابك بنجاح بمزامنة فورية مع نظام عيادة أزور.'
      };

      // Also update the admin clinical database with the newly registered password & email
      matchedAdminPatient.password = regPassword;
      matchedAdminPatient.email = regEmail.trim().toLowerCase();
      matchedAdminPatient.name = regName.trim();
      savePatients(adminPatients);
    } else {
      // Create a brand new patient record
      const newId = 'PAT-' + Math.floor(100000 + Math.random() * 900000);
      newPatient = {
        id: newId,
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        createdAt: new Date().toISOString(),
        medicalHistory: ['تم إنشاء الملف الطبي الإلكتروني بنجاح'],
        caseStatus: 'تحت المعاينة والاستشارة',
        clinicalNotes: 'مرحباً بك في عيادة أزور لطب الأسنان. سيقوم الطبيب بتحديث حالتك الطبية والإرشادات فور بدء الجلسات.'
      };

      // Also create this patient in the admin clinical database so they are perfectly synced
      const newAdminPatient: ExtendedPatient = {
        id: newId,
        name: regName.trim(),
        phone: regPhone.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
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
        createdAt: newPatient.createdAt
      };
      adminPatients.unshift(newAdminPatient);
      savePatients(adminPatients);
    }

    allPatients.unshift(newPatient);
    localStorage.setItem('azure_patients', JSON.stringify(allPatients));

    // Clear any leftover admin session items
    sessionStorage.removeItem('azure_admin_authenticated');
    sessionStorage.removeItem('azure_user_role');
    sessionStorage.removeItem('azure_user_name');
    sessionStorage.removeItem('azure_user_email');

    // Auto log in
    setActivePatient(newPatient);
    localStorage.setItem('azure_active_patient', JSON.stringify(newPatient));
    
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setRegName('');
      setRegPhone('');
      setRegEmail('');
      setRegPassword('');
    }, 2000);
  };

  // Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.warn("Patient logout request failed:", e);
    }
    localStorage.removeItem('azure_active_patient');
    sessionStorage.removeItem('azure_admin_authenticated');
    sessionStorage.removeItem('azure_user_role');
    sessionStorage.removeItem('azure_user_name');
    sessionStorage.removeItem('azure_user_email');
    setActivePatient(null);
    setMyAppointments([]);
  };

  // Cancel Appointment
  const handleDeleteAppointment = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟')) {
      const existing = localStorage.getItem('azure_bookings');
      if (existing) {
        try {
          const parsed = JSON.parse(existing) as Appointment[];
          const updated = parsed.filter(app => app.id !== id);
          localStorage.setItem('azure_bookings', JSON.stringify(updated));
          // Update local appointments list
          setMyAppointments(myAppointments.filter(app => app.id !== id));
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  // WhatsApp verification message helper
  const handleWhatsAppVerify = (app: Appointment) => {
    const text = `السلام عليكم عيادة أزور لطب الأسنان،
أريد الاستفسار عن موعد حجز مسجل عبر ملفي الطبي:

• رقم الملف: *${activePatient?.id || 'غير معروف'}*
• كود الحجز: *${app.id}*
• الاسم: *${app.name}*
• الخدمة المطلوبة: *${app.service}*
• الطبيب: *${app.doctor}*
• الموعد المقرر: *${app.date}* الساعة *${app.time}*

أرجو إفادتي بحالة الحجز، وشكراً لكم.`;
    window.open(`https://wa.me/${CLINIC_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
      />

      {/* Drawer Panel */}
      <div className="absolute inset-y-0 right-0 max-w-full flex" dir="rtl">
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-screen max-w-md bg-slate-50 border-l border-slate-100 shadow-2xl flex flex-col h-full relative overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-sky-500 rounded-full"></span>
                {activePatient ? 'بوابة الملف الطبي للمريض' : 'بوابة تسجيل المرضى'}
              </h3>
              <p className="text-[11px] text-slate-400 font-medium font-sans">
                {activePatient ? 'متابعة حالتك العلاجية ومواعيدك النشطة' : 'سجل دخولك لتتبع حالتك الطبية وحجوزاتك'}
              </p>
            </div>
            <button
              id="close-my-bookings-drawer"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {!activePatient ? (
              /* Authentication Screens (Tabs) */
              <div className="space-y-4">
                {/* Custom Tab selectors */}
                <div className="flex bg-slate-200/60 p-1 rounded-xl">
                  <button
                    id="auth-tab-login"
                    onClick={() => { setAuthTab('login'); setLoginError(''); setRegError(''); }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      authTab === 'login' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    تسجيل الدخول للمرضى
                  </button>
                  <button
                    id="auth-tab-register"
                    onClick={() => { setAuthTab('register'); setLoginError(''); setRegError(''); }}
                    className={`flex-1 py-2.5 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      authTab === 'register' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    إنشاء ملف طبي جديد
                  </button>
                </div>

                {authTab === 'login' ? (
                  /* Login Screen */
                  <form onSubmit={handleLogin} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="text-center pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">مرحباً بك مجدداً في عيادة Azure Dental</h4>
                      <p className="text-[10px] text-slate-400 mt-1">أدخل بياناتك المسجلة للوصول إلى تفاصيل علاجك</p>
                    </div>

                    {loginError && (
                      <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{loginError}</span>
                      </div>
                    )}

                    {/* Phone or Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">رقم الهاتف أو البريد الإلكتروني</label>
                      <div className="relative">
                        <input
                          id="login-phone-email-input"
                          type="text"
                          value={loginPhoneOrEmail}
                          onChange={(e) => setLoginPhoneOrEmail(e.target.value)}
                          placeholder="مثال: 01012345678"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">كلمة المرور</label>
                      <div className="relative">
                        <input
                          id="login-password-input"
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                    
                    <button
                      id="btn-login-submit"
                      type="submit"
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-slate-900/10 cursor-pointer"
                    >
                      تسجيل دخول للملف الطبي
                    </button>


                  </form>
                ) : (
                  /* Register Screen */
                  <form onSubmit={handleRegister} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                    <div className="text-center pb-2">
                      <h4 className="font-bold text-slate-800 text-sm">افتح ملفك الطبي بـ Azure Dental</h4>
                      <p className="text-[10px] text-slate-400 mt-1">تتيح لك البوابة تتبع حالتك العلاجية وتوجيهات الأطباء</p>
                    </div>

                    {regSuccess && (
                      <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                        <span>تم إنشاء الحساب والملف الطبي بنجاح! جاري دخولك...</span>
                      </div>
                    )}

                    {regError && (
                      <div className="p-3 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{regError}</span>
                      </div>
                    )}

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">اسم المريض الكامل</label>
                      <div className="relative">
                        <input
                          id="reg-name-input"
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="مثال: يوسف محمد أحمد"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <User className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">رقم الهاتف (واتساب لتلقي تأكيد المواعيد)</label>
                      <div className="relative">
                        <input
                          id="reg-phone-input"
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="مثال: 01039591109"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-left focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                          dir="ltr"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">البريد الإلكتروني</label>
                      <div className="relative">
                        <input
                          id="reg-email-input"
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono text-left focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                          dir="ltr"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">كلمة المرور لحماية ملفك</label>
                      <div className="relative">
                        <input
                          id="reg-password-input"
                          type="password"
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="أدخل كلمة مرور قوية"
                          className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:outline-none focus:border-sky-500 transition-all text-slate-700"
                        />
                        <span className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </span>
                      </div>
                    </div>

                    <button
                      id="btn-register-submit"
                      type="submit"
                      className="w-full py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl transition-all shadow-sm shadow-sky-500/10 cursor-pointer"
                    >
                      تسجيل وإنشاء الملف الطبي
                    </button>
                  </form>
                )}
              </div>
            ) : (
              /* Authenticated Patient Dashboard Portal */
              <div className="space-y-5">
                
                {/* Greeting Card */}
                <div className="bg-gradient-to-r from-slate-900 to-sky-950 rounded-2xl p-5 text-white relative overflow-hidden shadow-md">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl" />
                  
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sky-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-sky-400 font-bold block">مرحباً بك في أزور للأسنان</span>
                      <h4 className="font-black text-sm sm:text-base leading-tight mt-0.5">{activePatient.name}</h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-5 pt-4 border-t border-white/10 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 text-[9px] block">رقم الملف الطبي:</span>
                      <span className="text-sky-300 font-bold">{activePatient.id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">حالة الخطة العلاجية:</span>
                      <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/20">
                        {activePatient.caseStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1. MEDICAL FILE DETAILS & TREATMENT TRACKING (Requested Explicitly!) */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                      <Activity className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">الملف الطبي وتتبع الحالة العلاجية</h4>
                      <p className="text-[10px] text-slate-400">تحديثات الأطباء بخصوص أسنانك وخطتك</p>
                    </div>
                  </div>

                  {/* Doctor instructions/notes */}
                  <div className="bg-amber-50/50 border border-amber-100/60 rounded-xl p-3.5">
                    <span className="text-[10px] font-bold text-amber-800 block">توجيهات وإرشادات دكتور العيادة المباشر:</span>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed italic">
                      "{activePatient.clinicalNotes || 'لا توجد توجيهات مسجلة لحالتك حالياً. احرص على متابعة الإرشادات بعد كل جلسة.'}"
                    </p>
                  </div>

                  {/* Treatments list / history */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 block">قائمة الإجراءات الطبية والجلسات:</span>
                    
                    {(!activePatient.medicalHistory || activePatient.medicalHistory.length === 0) ? (
                      <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl">لا توجد إجراءات مسجلة بعد.</p>
                    ) : (
                      <div className="space-y-2">
                        {activePatient.medicalHistory.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 text-xs font-bold font-mono">
                              {idx + 1}
                            </span>
                            <span className="text-xs text-slate-700 leading-normal font-semibold">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 1.5 FINANCIAL & TREATMENT PLAN PORTAL */}
                {patientStats && (
                  <div className="space-y-4">
                    {/* Financial Stats Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-emerald-50/70 border border-emerald-100/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-emerald-800">إجمالي المدفوع للعيادة</span>
                          <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Coins className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-lg sm:text-xl font-black text-emerald-950 font-mono">{patientStats.totalSpent}</span>
                          <span className="text-[10px] text-emerald-700 font-bold mr-1">ج.م</span>
                        </div>
                      </div>

                      <div className="bg-rose-50/70 border border-rose-100/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black text-rose-800">المتبقي للعيادة</span>
                          <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                            <DollarSign className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="mt-3">
                          <span className="text-lg sm:text-xl font-black text-rose-950 font-mono">{patientStats.outstandingBalance}</span>
                          <span className="text-[10px] text-rose-700 font-bold mr-1">ج.م</span>
                        </div>
                      </div>
                    </div>

                    {/* Treatment Plans Progress */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-50">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                          <Activity className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">الخطط العلاجية والجلسات</h4>
                          <p className="text-[10px] text-slate-400">تتبع تقدم خططك وتركيبات الأسنان</p>
                        </div>
                      </div>

                      {patientStats.treatmentPlans.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4 bg-slate-50 rounded-xl leading-relaxed">
                          لا توجد خطط علاجية نشطة مسجلة لحسابك حالياً. سيقوم الطبيب بإضافة خطتك الطبية هنا فور بدء الجلسات العلاجية.
                        </p>
                      ) : (
                        <div className="space-y-3.5">
                          {patientStats.treatmentPlans.map((plan) => {
                            const totalSessions = plan.sessions?.length || 0;
                            const completedSessions = plan.sessions?.filter(s => s.completed).length || 0;
                            const percent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
                            
                            return (
                              <div key={plan.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/40 hover:bg-slate-50 transition-colors">
                                <div className="flex justify-between items-start gap-2">
                                  <div>
                                    <h5 className="font-extrabold text-slate-900 text-xs">{plan.title}</h5>
                                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{plan.description}</p>
                                  </div>
                                  <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                    plan.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                    plan.status === 'In Progress' ? 'bg-sky-50 text-sky-600 border border-sky-100' :
                                    'bg-slate-100 text-slate-500'
                                  }`}>
                                    {plan.status === 'Completed' ? 'مكتملة' : plan.status === 'In Progress' ? 'قيد التنفيذ' : 'مخطط لها'}
                                  </span>
                                </div>

                                {/* Progress Bar */}
                                {totalSessions > 0 && (
                                  <div className="mt-3.5 space-y-1.5">
                                    <div className="flex justify-between text-[9px] font-bold">
                                      <span className="text-slate-400">جلسات العلاج المكتملة</span>
                                      <span className="text-indigo-600 font-mono">{completedSessions} من {totalSessions} ({percent}%)</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <div 
                                        className="h-full bg-gradient-to-l from-indigo-500 to-sky-500 rounded-full transition-all duration-500"
                                        style={{ width: `${percent}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Plan Cost Detail */}
                                <div className="mt-3 pt-2.5 border-t border-slate-100/60 flex justify-between text-[10px] font-bold text-slate-600">
                                  <span>تكلفة الخطة: <strong className="text-slate-900 font-mono">{plan.totalCost} ج.م</strong></span>
                                  <span>المدفوع: <strong className="text-emerald-600 font-mono">{plan.paidAmount} ج.م</strong></span>
                                  <span>المتبقي: <strong className="text-rose-600 font-mono">{Math.max(0, plan.totalCost - plan.paidAmount)} ج.م</strong></span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. APPOINTMENTS SECTION */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-500">
                        <Calendar className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-800 text-xs sm:text-sm">حجوزاتي المجدولة</h4>
                        <p className="text-[10px] text-slate-400">تتبع تأكيد مواعيد عيادتك</p>
                      </div>
                    </div>
                    {onOpenBooking && (
                      <button
                        id="portal-book-new-btn"
                        onClick={onOpenBooking}
                        className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm shadow-sky-500/10 cursor-pointer"
                      >
                        حجز جديد +
                      </button>
                    )}
                  </div>

                  {myAppointments.length === 0 ? (
                    <div className="text-center py-8 px-4 space-y-3">
                      <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-slate-700 text-xs">لا توجد حجوزات مجدولة</h5>
                        <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                          لم تقم بحجز أي موعد مرتبط برقم هاتفك حتى الآن. احجز موعداً إلكترونياً وسيرتبط بملفك تلقائياً!
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myAppointments.map((app) => (
                        <div
                          id={`my-portal-app-${app.id}`}
                          key={app.id}
                          className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-3 relative overflow-hidden"
                        >
                          {/* Top indicator bar */}
                          <div className={`absolute top-0 right-0 w-1.5 h-full ${
                            app.status === 'confirmed' ? 'bg-emerald-500' : 'bg-amber-400'
                          }`} />

                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] text-slate-400 font-mono">رقم الحجز: #{app.id}</span>
                              <h5 className="font-bold text-slate-800 text-xs mt-0.5">{app.service}</h5>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              app.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                            }`}>
                              {app.status === 'confirmed' ? 'مؤكد' : 'قيد التأكيد'}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                            <div>
                              <span className="text-[9px] text-slate-400 block">الطبيب:</span>
                              <span className="font-semibold text-slate-700">{app.doctor}</span>
                            </div>
                            <div>
                              <span className="text-[9px] text-slate-400 block">التاريخ والوقت:</span>
                              <span className="font-bold text-slate-700 font-mono text-[10px]">{app.date} • {app.time}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <button
                              id={`btn-verify-wa-${app.id}`}
                              onClick={() => handleWhatsAppVerify(app)}
                              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>تأكيد واتساب</span>
                            </button>

                            <button
                              id={`btn-cancel-app-${app.id}`}
                              onClick={() => handleDeleteAppointment(app.id)}
                              className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>إلغاء</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Account Actions (Logout) */}
                <div className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400">متصل بملفك الإلكتروني الآمن</span>
                  </div>
                  <button
                    id="btn-patient-logout"
                    onClick={handleLogout}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>تسجيل خروج</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Footer Inside Drawer */}
          <div className="p-5 border-t border-slate-100 bg-white flex flex-col gap-3 shrink-0">
            <div className="flex items-start gap-2 text-xs text-slate-500 leading-normal">
              <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-400">
                ملفك الطبي ومواعيدك محمية ومحفوظة بموجب معايير خصوصية المرضى لعيادة Azure Dental ميت غمر.
              </p>
            </div>
            <div className="flex justify-center items-center gap-1 text-[9px] text-slate-300 font-mono">
              <Heart className="w-3 h-3 text-red-400 fill-red-400" />
              <span>Azure Care System v1.1</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
