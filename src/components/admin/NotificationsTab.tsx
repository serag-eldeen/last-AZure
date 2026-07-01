import React, { useState } from 'react';
import { 
  Bell, Check, Trash2, ShieldAlert, Calendar, RefreshCw, Filter, 
  Package, DollarSign, Activity, BellRing, Sparkles, MessageSquare, User 
} from 'lucide-react';
import { AdminNotification, NotificationType, NotificationPriority } from '../../adminTypes';
import { getNotifications, saveNotifications, deleteNotification } from '../../clinicDb';

interface NotificationsTabProps {
  triggerRefresh: () => void;
}

const TYPE_ICONS: Record<NotificationType, any> = {
  Appointments: Calendar,
  Inventory: Package,
  Payments: DollarSign,
  Treatments: Activity,
  Patients: User,
  System: ShieldAlert
};

const TYPE_LABELS: Record<NotificationType, string> = {
  Appointments: 'الحجوزات والمواعيد',
  Inventory: 'المستودع والمخازن',
  Payments: 'المدفوعات والمالية',
  Treatments: 'خطط العلاج والعيادة',
  Patients: 'دليل المرضى والملفات',
  System: 'تنبيهات النظام السحابي'
};

const PRIORITY_COLORS: Record<NotificationPriority, { text: string; bg: string; border: string }> = {
  High: { text: 'text-red-700', bg: 'bg-red-50', border: 'border-red-100' },
  Medium: { text: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100' },
  Low: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100' }
};

export default function NotificationsTab({ triggerRefresh }: NotificationsTabProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>(() => getNotifications());
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const refreshData = () => {
    setNotifications(getNotifications());
  };

  const handleMarkAsRead = (id: string) => {
    const list = getNotifications();
    const updated = list.map(n => n.id === id ? { ...n, read: true } : n);
    saveNotifications(updated);
    setNotifications(updated);
    triggerRefresh();
  };

  const handleMarkAllAsRead = () => {
    const list = getNotifications();
    const updated = list.map(n => ({ ...n, read: true }));
    saveNotifications(updated);
    setNotifications(updated);
    triggerRefresh();
  };

  const handleClearNotification = (id: string) => {
    deleteNotification(id);
    const filtered = notifications.filter(n => n.id !== id);
    setNotifications(filtered);
    triggerRefresh();
  };

  const handleClearAll = () => {
    setConfirmAction({
      message: 'هل تريد مسح كل الإشعارات وسجل التنبيهات بالكامل؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        saveNotifications([]);
        setNotifications([]);
        triggerRefresh();
      }
    });
  };

  // Filter List
  const filteredNotifications = notifications.filter(n => {
    const matchesType = typeFilter === 'all' || n.type === typeFilter;
    const matchesPriority = priorityFilter === 'all' || n.priority === priorityFilter;
    return matchesType && matchesPriority;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل الفئات الطبية</option>
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل درجات الأهمية</option>
            <option value="High">أهمية قصوى (حمراء)</option>
            <option value="Medium">متوسطة الأولوية</option>
            <option value="Low">تنبيهات عادية</option>
          </select>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={refreshData}
            className="p-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              تعليم الكل كمقروء ✓
            </button>
          )}

          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
          >
            مسح الكل
          </button>
        </div>

      </div>

      {/* Notifications Grid list */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        
        <div className="flex justify-between items-center border-b border-slate-50 pb-3">
          <h3 className="font-black text-slate-800 text-sm flex items-center gap-2">
            <BellRing className="w-5 h-5 text-indigo-500" />
            <span>لوحة تنبيهات النظام الطارئة بالعيادة</span>
          </h3>
          {unreadCount > 0 && (
            <span className="text-xs bg-red-500 text-white font-black px-2.5 py-1 rounded-full animate-bounce">
              {unreadCount} تنبيه غير مقروء
            </span>
          )}
        </div>

        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400 text-xs">
              <Sparkles className="w-12 h-12 text-slate-100 mx-auto mb-3" />
              <h4 className="font-bold text-slate-600">لا توجد إشعارات حالية</h4>
              <p className="text-[10px] text-slate-400 mt-1">كل شيء يسير بسلاسة، والمخزون وحجوزات الأطباء تحت السيطرة!</p>
            </div>
          ) : (
            filteredNotifications.map(n => {
              const IconComp = TYPE_ICONS[n.type] || Bell;
              const prio = PRIORITY_COLORS[n.priority] || PRIORITY_COLORS.Low;

              return (
                <div
                  key={n.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    n.read 
                      ? 'bg-slate-50/50 border-slate-100' 
                      : 'bg-indigo-50/10 border-indigo-100/60 shadow-sm'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${prio.bg} ${prio.text} ${prio.border} border`}>
                      <IconComp className="w-4.5 h-4.5" />
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className={`font-black text-xs ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>
                          {n.title}
                        </strong>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded ${prio.bg} ${prio.text}`}>
                          {n.priority === 'High' ? 'هام جداً' : n.priority === 'Medium' ? 'متوسط' : 'عادي'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">({TYPE_LABELS[n.type]})</span>
                      </div>
                      <p className={`text-xs ${n.read ? 'text-slate-400' : 'text-slate-600'}`}>
                        {n.message}
                      </p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">{n.createdAt.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                  </div>

                  <div className="flex gap-1.5 self-end sm:self-center">
                    {!n.read && (
                      <button
                        onClick={() => handleMarkAsRead(n.id)}
                        className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-black transition-all cursor-pointer"
                        title="تعليم كمقروء"
                      >
                        قراءة ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleClearNotification(n.id)}
                      className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="مسح الإشعار"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              );
            })
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
