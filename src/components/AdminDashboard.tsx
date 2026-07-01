import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, Unlock, ShieldAlert, X, RefreshCw, User, 
  Calendar, CreditCard, Plus, Check, TrendingUp, AlertCircle, Info,
  FileText, Activity, Layers, Bell, Activity as ChartIcon 
} from 'lucide-react';

import PatientManagementTab from './admin/PatientManagementTab';
import AppointmentManagementTab from './admin/AppointmentManagementTab';
import DentalChartTab from './admin/DentalChartTab';
import TreatmentPlanTab from './admin/TreatmentPlanTab';
import BillingTab from './admin/BillingTab';
import FinanceTab from './admin/FinanceTab';
import InventoryTab from './admin/InventoryTab';
import NotificationsTab from './admin/NotificationsTab';

import { initClinicDb, getNotifications } from '../clinicDb';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRefresh?: boolean;
  onDataChanged?: () => void;
}

type AdminTab = 
  | 'appointments' 
  | 'patients' 
  | 'dental-chart' 
  | 'treatment-plans' 
  | 'billing' 
  | 'finance' 
  | 'inventory' 
  | 'notifications';

export default function AdminDashboard({ isOpen, onClose, triggerRefresh, onDataChanged }: AdminDashboardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('appointments');
  const [refreshKey, setRefreshKey] = useState(0);

  // Notifications bubble badge state
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const getUserRole = (): string => {
    return sessionStorage.getItem('azure_user_role') || 'ADMIN';
  };

  const updateNotificationsCount = () => {
    try {
      const list = getNotifications();
      setUnreadNotifications(list.filter(n => !n.read).length);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = sessionStorage.getItem("azure_access_token") || localStorage.getItem("azure_access_token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch("/api/auth/me", { headers, credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.user && data.user.role && data.user.role !== "PATIENT") {
            sessionStorage.setItem('azure_admin_authenticated', 'true');
            sessionStorage.setItem('azure_user_role', data.user.role);
            sessionStorage.setItem('azure_user_name', data.user.name);
            sessionStorage.setItem('azure_user_email', data.user.email);
            setIsAuthenticated(true);
            initClinicDb(true).then(() => {
              updateNotificationsCount();
            });
          } else {
            setIsAuthenticated(false);
            sessionStorage.removeItem('azure_admin_authenticated');
          }
        } else {
          setIsAuthenticated(false);
          sessionStorage.removeItem('azure_admin_authenticated');
        }
      } catch (err) {
        console.warn("Auth verify failed:", err);
        setIsAuthenticated(false);
        sessionStorage.removeItem('azure_admin_authenticated');
      }
    };

    if (isOpen) {
      verifyAuth();
    }
  }, [isOpen]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode) {
      setAuthError('يرجى إدخال رمز المرور');
      return;
    }
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ passcode })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user && data.user.role && data.user.role !== "PATIENT") {
          sessionStorage.setItem('azure_admin_authenticated', 'true');
          sessionStorage.setItem('azure_user_role', data.user.role);
          sessionStorage.setItem('azure_user_name', data.user.name);
          sessionStorage.setItem('azure_user_email', data.user.email);
          if (data.token) {
            sessionStorage.setItem('azure_access_token', data.token);
            localStorage.setItem('azure_access_token', data.token);
          }
          if (data.refreshToken) {
            sessionStorage.setItem('azure_refresh_token', data.refreshToken);
            localStorage.setItem('azure_refresh_token', data.refreshToken);
          }
          setIsAuthenticated(true);
          setAuthError('');
          setPasscode('');
          await initClinicDb(true);
          updateNotificationsCount();
        } else {
          setAuthError('عذراً، هذا الحساب غير مصرح له كمسؤول/طبيب.');
          setPasscode('');
        }
      } else {
        setAuthError('رمز المرور خاطئ! يرجى المحاولة مرة أخرى.');
        setPasscode('');
      }
    } catch (err) {
      console.error("Login verification failed:", err);
      setAuthError('تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقًا.');
      setPasscode('');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
    } catch (e) {
      console.warn("Logout request failed:", e);
    }
    setIsAuthenticated(false);
    sessionStorage.removeItem('azure_admin_authenticated');
    sessionStorage.removeItem('azure_user_role');
    sessionStorage.removeItem('azure_user_name');
    sessionStorage.removeItem('azure_user_email');
  };

  const handleLocalRefresh = () => {
    setRefreshKey(prev => prev + 1);
    updateNotificationsCount();
    if (onDataChanged) onDataChanged();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6" dir="rtl">
      
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        className="bg-white rounded-[28px] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] border border-slate-100"
      >
        {/* Banner Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-sky-950 p-5 text-white flex justify-between items-center relative shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-sky-400">
              {isAuthenticated ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">لوحة إدارة عيادة Azure Dental 🦷</h2>
              <p className="text-xs text-sky-400/85 mt-0.5">النظام السحابي الشامل لإدارة الحجوزات، المرضى، الحسابات والمستودع</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-slate-300 focus:outline-none cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Shield block */}
        {!isAuthenticated ? (
          <div className="p-8 sm:p-16 flex flex-col items-center justify-center flex-grow overflow-y-auto text-center">
            <div className="w-14 h-14 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-500 mb-6">
              <ShieldAlert className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-black text-slate-800 mb-1.5">بوابة العيادة الطبية المقيدة</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-8 leading-relaxed">
              يرجى كتابة رمز المرور الإداري المعتمد للعيادة لعرض الحجوزات، المخططات السنية، خطط العلاج والمخزون.
            </p>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div>
                <label className="block text-right text-[11px] font-bold text-slate-400 mb-1.5">أدخل رمز المرور:</label>
                <div className="relative">
                  <input
                    type="password"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-center font-mono text-lg focus:outline-none focus:ring-2 focus:ring-sky-500/10 focus:border-sky-500 transition-all"
                    autoFocus
                  />
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2 justify-center">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                تأكيد الدخول الآمن للعيادة
              </button>
            </form>
          </div>
        ) : (
          /* Main Authenticated View */
          <div className="flex flex-col flex-grow overflow-hidden bg-slate-50/50">
            
            {/* Horizontal Nav Bar Strip */}
            <div className="bg-white border-b border-slate-100 p-3 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0">
              
              {/* Tabs list with full scope integration */}
              <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'appointments' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>جدولة الحجوزات 📅</span>
                </button>

                <button
                  onClick={() => setActiveTab('patients')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'patients' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>ملفات المرضى 👥</span>
                </button>

                {getUserRole() !== 'RECEPTIONIST' && (
                  <button
                    onClick={() => setActiveTab('dental-chart')}
                    className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'dental-chart' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>مخطط الأسنان 🦷</span>
                  </button>
                )}

                {getUserRole() !== 'RECEPTIONIST' && (
                  <button
                    onClick={() => setActiveTab('treatment-plans')}
                    className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'treatment-plans' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>خطط العلاج 📋</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('billing')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'billing' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>الفواتير والدفع 🧾</span>
                </button>

                {getUserRole() !== 'RECEPTIONIST' && (
                  <button
                    onClick={() => setActiveTab('finance')}
                    className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'finance' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>المالية والأرباح 📊</span>
                  </button>
                )}

                {getUserRole() !== 'RECEPTIONIST' && (
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
                      activeTab === 'inventory' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>جرد المستودع 📦</span>
                  </button>
                )}

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3 py-1.5 text-[11px] font-black rounded-xl transition-all flex items-center gap-1.5 cursor-pointer relative ${
                    activeTab === 'notifications' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>التنبيهات 🔔</span>
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 text-white font-mono text-[8px] rounded-full flex items-center justify-center font-bold">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>

              {/* Log out controls */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleLocalRefresh}
                  className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 border border-slate-100 rounded-xl"
                  title="مزامنة قاعدة البيانات"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-xl transition-all border border-red-50 cursor-pointer"
                >
                  تسجيل خروج
                </button>
              </div>

            </div>

            {/* Render Tab Bodies cleanly with refresh key triggers */}
            <div className="flex-grow overflow-y-auto p-4 sm:p-6" key={refreshKey}>
              {activeTab === 'appointments' && (
                <AppointmentManagementTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'patients' && (
                <PatientManagementTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'dental-chart' && (
                <DentalChartTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'treatment-plans' && (
                <TreatmentPlanTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'billing' && (
                <BillingTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'finance' && (
                <FinanceTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'inventory' && (
                <InventoryTab triggerRefresh={handleLocalRefresh} />
              )}
              {activeTab === 'notifications' && (
                <NotificationsTab triggerRefresh={handleLocalRefresh} />
              )}
            </div>

          </div>
        )}

      </motion.div>
    </div>
  );
}
