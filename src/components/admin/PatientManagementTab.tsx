import React, { useState } from 'react';
import { 
  Search, Filter, Plus, User, Phone, Mail, Award, Activity, Heart, ShieldAlert, 
  ChevronRight, Calendar, DollarSign, RefreshCw, Upload, Check, Trash2, Eye, Edit 
} from 'lucide-react';
import { ExtendedPatient, EmergencyContact, InsuranceInfo } from '../../adminTypes';
import { getPatients, savePatients, recalculatePatientBalances, getPatientChart, deletePatient } from '../../clinicDb';

interface PatientManagementTabProps {
  onSelectPatientChart?: (patientId: string) => void;
  triggerRefresh: () => void;
}

export default function PatientManagementTab({ onSelectPatientChart, triggerRefresh }: PatientManagementTabProps) {
  const [patients, setPatients] = useState<ExtendedPatient[]>(() => getPatients());
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bloodFilter, setBloodFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'spent' | 'balance' | 'created'>('created');
  
  // Selection
  const [selectedPatient, setSelectedPatient] = useState<ExtendedPatient | null>(null);

  // Add Patient Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bloodType, setBloodType] = useState('O+');
  const [isActive, setIsActive] = useState(true);
  
  // Emergency Contact
  const [emName, setEmName] = useState('');
  const [emPhone, setEmPhone] = useState('');
  const [emRelation, setEmRelation] = useState('');

  // Medical info
  const [conditionInput, setConditionInput] = useState('');
  const [conditions, setConditions] = useState<string[]>([]);
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState<string[]>([]);

  // Insurance info
  const [insProvider, setInsProvider] = useState('');
  const [insPolicy, setInsPolicy] = useState('');
  const [insDiscount, setInsDiscount] = useState(0);

  // Photo
  const [photoBase64, setPhotoBase64] = useState<string | undefined>(undefined);

  // Edit Patient State
  const [isEditingSelected, setIsEditingSelected] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editBloodType, setEditBloodType] = useState('O+');
  const [editIsActive, setEditIsActive] = useState(true);
  const [editEmName, setEditEmName] = useState('');
  const [editEmPhone, setEditEmPhone] = useState('');
  const [editEmRelation, setEditEmRelation] = useState('');

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);
  const [editInsProvider, setEditInsProvider] = useState('');
  const [editInsPolicy, setEditInsPolicy] = useState('');
  const [editInsDiscount, setEditInsDiscount] = useState(0);
  const [editConditions, setEditConditions] = useState<string[]>([]);
  const [editAllergies, setEditAllergies] = useState<string[]>([]);
  const [editConditionInput, setEditConditionInput] = useState('');
  const [editAllergyInput, setEditAllergyInput] = useState('');

  const startEditingSelected = (patient: ExtendedPatient) => {
    setEditName(patient.name || '');
    setEditPhone(patient.phone || '');
    setEditEmail(patient.email || '');
    setEditBloodType(patient.bloodType || 'O+');
    setEditIsActive(patient.isActive);
    setEditEmName(patient.emergencyContact?.name || '');
    setEditEmPhone(patient.emergencyContact?.phone || '');
    setEditEmRelation(patient.emergencyContact?.relation || '');
    setEditInsProvider(patient.insurance?.provider || '');
    setEditInsPolicy(patient.insurance?.policyNumber || '');
    setEditInsDiscount(patient.insurance?.discountPercent || 0);
    setEditConditions(patient.medicalConditions || []);
    setEditAllergies(patient.allergies || []);
    setEditConditionInput('');
    setEditAllergyInput('');
    setIsEditingSelected(true);
  };

  const handleSaveSelectedEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (!editName.trim() || !editPhone.trim()) {
      alert('الاسم ورقم الهاتف حقول إلزامية.');
      return;
    }

    const updatedPatient: ExtendedPatient = {
      ...selectedPatient,
      name: editName.trim(),
      phone: editPhone.trim(),
      email: editEmail.trim(),
      bloodType: editBloodType,
      isActive: editIsActive,
      emergencyContact: {
        name: editEmName.trim() || 'غير محدد',
        phone: editEmPhone.trim() || 'غير محدد',
        relation: editEmRelation.trim() || 'غير محدد'
      },
      medicalConditions: editConditions,
      allergies: editAllergies,
      insurance: {
        provider: editInsProvider.trim() || 'لا يوجد تأمين',
        policyNumber: editInsPolicy.trim() || '',
        discountPercent: Number(editInsDiscount) || 0
      }
    };

    // 1. Update in admin patients database
    const allAdminPatients = getPatients();
    const idx = allAdminPatients.findIndex(p => p.id === selectedPatient.id);
    if (idx !== -1) {
      allAdminPatients[idx] = updatedPatient;
      savePatients(allAdminPatients);
    }

    // 2. Also update in website patients database (azure_patients) to keep in sync!
    const azurePatientsStr = localStorage.getItem('azure_patients');
    if (azurePatientsStr) {
      try {
        const azurePatients = JSON.parse(azurePatientsStr) as any[];
        const azIdx = azurePatients.findIndex(p => p && p.id === selectedPatient.id);
        if (azIdx !== -1) {
          azurePatients[azIdx] = {
            ...azurePatients[azIdx],
            name: editName.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim(),
            medicalHistory: editConditions.length > 0 ? editConditions : ['تم تحديث الملف الطبي الإلكتروني بنجاح'],
            caseStatus: editIsActive ? 'نشط' : 'غير نشط'
          };
          localStorage.setItem('azure_patients', JSON.stringify(azurePatients));
        }
      } catch (err) {
        console.error(err);
      }
    }

    // 3. Also update active patient session if they edited the currently logged-in patient
    const activePatientStr = localStorage.getItem('azure_active_patient');
    if (activePatientStr) {
      try {
        const activePat = JSON.parse(activePatientStr);
        if (activePat && activePat.id === selectedPatient.id) {
          const updatedActive = {
            ...activePat,
            name: editName.trim(),
            phone: editPhone.trim(),
            email: editEmail.trim(),
            medicalHistory: editConditions.length > 0 ? editConditions : ['تم تحديث الملف الطبي الإلكتروني بنجاح'],
            caseStatus: editIsActive ? 'نشط' : 'غير نشط'
          };
          localStorage.setItem('azure_active_patient', JSON.stringify(updatedActive));
        }
      } catch (err) {
        console.error(err);
      }
    }

    setIsEditingSelected(false);
    setSelectedPatient(updatedPatient);
    refreshData();
    triggerRefresh();
  };

  const refreshData = () => {
    recalculatePatientBalances();
    const fresh = getPatients();
    setPatients(fresh);
    if (selectedPatient) {
      const updatedSel = fresh.find(p => p.id === selectedPatient.id);
      if (updatedSel) setSelectedPatient(updatedSel);
    }
  };

  // Base64 Photo Upload Handler
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      setConditions([...conditions, conditionInput.trim()]);
      setConditionInput('');
    }
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      setAllergies([...allergies, allergyInput.trim()]);
      setAllergyInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleRegisterPatient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('الاسم ورقم الهاتف حقول إلزامية.');
      return;
    }

    const newPat: ExtendedPatient = {
      id: 'PAT-' + Math.floor(100000 + Math.random() * 900000).toString(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || 'patient@dentalflow.pro',
      password: '123', // standard patient app password
      bloodType,
      emergencyContact: {
        name: emName.trim() || 'غير محدد',
        phone: emPhone.trim() || 'غير محدد',
        relation: emRelation.trim() || 'غير محدد'
      },
      medicalConditions: conditions,
      allergies: allergies,
      insurance: {
        provider: insProvider.trim() || 'لا يوجد تأمين',
        policyNumber: insPolicy.trim() || '',
        discountPercent: Number(insDiscount) || 0
      },
      photoUrl: photoBase64 || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150',
      isActive,
      totalSpent: 0,
      outstandingBalance: 0,
      createdAt: new Date().toISOString()
    };

    const currentList = getPatients();
    currentList.unshift(newPat);
    savePatients(currentList);

    // Reset Form
    setName('');
    setPhone('');
    setEmail('');
    setBloodType('O+');
    setIsActive(true);
    setEmName('');
    setEmPhone('');
    setEmRelation('');
    setConditions([]);
    setAllergies([]);
    setInsProvider('');
    setInsPolicy('');
    setInsDiscount(0);
    setPhotoBase64(undefined);
    setShowAddForm(false);

    refreshData();
    triggerRefresh();
  };

  const togglePatientActive = (patientId: string) => {
    const list = getPatients();
    const updated = list.map(p => {
      if (p.id === patientId) {
        return { ...p, isActive: !p.isActive };
      }
      return p;
    });
    savePatients(updated);
    refreshData();
    triggerRefresh();
  };

  const handleDeletePatient = (patientId: string) => {
    const userRole = sessionStorage.getItem('azure_user_role') || 'ADMIN';
    if (userRole === 'RECEPTIONIST') {
      alert('عذراً، لا يمتلك موظف الاستقبال صلاحية حذف سجلات المرضى.');
      return;
    }

    setConfirmAction({
      message: 'هل أنت متأكد من حذف هذا المريض وكل سجلاته من النظام بشكل نهائي؟ لا يمكن التراجع عن هذا الإجراء.',
      onConfirm: () => {
        deletePatient(patientId);
        if (selectedPatient?.id === patientId) setSelectedPatient(null);
        refreshData();
        triggerRefresh();
      }
    });
  };

  // Filter & Sort Logic
  const filteredPatients = patients.filter(p => {
    const query = search.toLowerCase();
    const matchesQuery = 
      p.name.toLowerCase().includes(query) || 
      p.phone.includes(query) || 
      p.id.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query);

    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && p.isActive) || 
      (statusFilter === 'inactive' && !p.isActive);

    const matchesBlood = 
      bloodFilter === 'all' || p.bloodType === bloodFilter;

    return matchesQuery && matchesStatus && matchesBlood;
  }).sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
    if (sortBy === 'spent') return b.totalSpent - a.totalSpent;
    if (sortBy === 'balance') return b.outstandingBalance - a.outstandingBalance;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Search and Filters panel */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="ابحث بالاسم، المعرف أو الهاتف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all"
          />
          <Search className="absolute right-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e: any) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل الحالات (نشط/خامل)</option>
            <option value="active">المرضى النشطون فقط</option>
            <option value="inactive">المرضى الخاملون</option>
          </select>

          <select
            value={bloodFilter}
            onChange={(e) => setBloodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل فصائل الدم</option>
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="created">الأحدث تسجيلاً</option>
            <option value="name">الاسم أبجدياً</option>
            <option value="spent">الأكثر إنفاقاً</option>
            <option value="balance">الرصيد المعلق الأكبر</option>
          </select>

          <button
            onClick={refreshData}
            className="p-2 bg-slate-50 border border-slate-100 text-slate-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-sky-500/15 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مريض جديد</span>
          </button>
        </div>
      </div>

      {/* Add Patient Collapsible Form */}
      {showAddForm && (
        <form onSubmit={handleRegisterPatient} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-sky-500" />
              <span>استمارة تسجيل مريض جديد في الملف الطبي للعيادة</span>
            </h3>
            <button 
              type="button" 
              onClick={() => setShowAddForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              إلغاء [X]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Personal Details */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-sky-600 border-b border-sky-100 pb-1.5">البيانات الأساسية للملف الشخصي</h4>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">الاسم الكامل للمريض *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: يوسف محمد كمال"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الهاتف الجوال *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01012345678"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">فصيلة الدم</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">حالة الحساب</label>
                  <select
                    value={isActive ? 'true' : 'false'}
                    onChange={(e) => setIsActive(e.target.value === 'true')}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                  >
                    <option value="true">نشط</option>
                    <option value="false">خامل</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">صورة المريض (رفع ملف)</label>
                <div className="relative border border-dashed border-slate-300 rounded-xl p-2 bg-white flex flex-col items-center justify-center text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {photoBase64 ? (
                    <div className="flex items-center gap-2">
                      <img src={photoBase64} alt="preview" className="w-8 h-8 rounded-full object-cover border" />
                      <span className="text-[10px] text-emerald-600 font-bold">تم رفع الصورة ✓</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-slate-400 mb-1" />
                      <span className="text-[10px] text-slate-500">اختر صورة المريض</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Emergency & Insurance info */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-indigo-600 border-b border-indigo-100 pb-1.5">الاتصال بالطوارئ والتأمين الطبي</h4>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم جهة اتصال الطوارئ</label>
                <input
                  type="text"
                  value={emName}
                  onChange={(e) => setEmName(e.target.value)}
                  placeholder="أحمد منصور (الأب)"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم هاتف الطوارئ</label>
                  <input
                    type="text"
                    value={emPhone}
                    onChange={(e) => setEmPhone(e.target.value)}
                    placeholder="010XXXXXXXX"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">العلاقة</label>
                  <input
                    type="text"
                    value={emRelation}
                    onChange={(e) => setEmRelation(e.target.value)}
                    placeholder="أب / أم / زوج"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <h4 className="font-bold text-xs text-emerald-600 border-b border-emerald-100 pt-2 pb-1.5">بيانات شركة التأمين</h4>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">شركة التأمين الطبي</label>
                <input
                  type="text"
                  value={insProvider}
                  onChange={(e) => setInsProvider(e.target.value)}
                  placeholder="مثال: أكسا للرعاية الطبية"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم بوليصة التأمين</label>
                  <input
                    type="text"
                    value={insPolicy}
                    onChange={(e) => setInsPolicy(e.target.value)}
                    placeholder="AXA-992-11"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">خصم نسبة التأمين (%)</label>
                  <input
                    type="number"
                    value={insDiscount}
                    onChange={(e) => setInsDiscount(Number(e.target.value))}
                    placeholder="20"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>

            {/* Medical history & Allergies */}
            <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-xs text-rose-600 border-b border-rose-100 pb-1.5">الملف المرضي والحساسيات الطبية</h4>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">الأمراض المزمنة / الحالات الطبية</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={conditionInput}
                    onChange={(e) => setConditionInput(e.target.value)}
                    placeholder="مثال: سكري من النوع الثاني"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCondition())}
                  />
                  <button
                    type="button"
                    onClick={addCondition}
                    className="px-2.5 bg-rose-500 text-white rounded-lg text-xs font-bold"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-slate-100 rounded-xl">
                  {conditions.length === 0 && <span className="text-[10px] text-slate-400 p-1">لا توجد حالات مسجلة حالياً</span>}
                  {conditions.map((c, i) => (
                    <span key={i} className="text-[10px] bg-rose-50 text-rose-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <span>{c}</span>
                      <button type="button" onClick={() => removeCondition(i)} className="text-rose-400 hover:text-rose-600 font-extrabold text-[9px]">X</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">حساسيات من أدوية أو مواد</label>
                <div className="flex gap-1.5 mb-2">
                  <input
                    type="text"
                    value={allergyInput}
                    onChange={(e) => setAllergyInput(e.target.value)}
                    placeholder="مثال: حساسية البنسلين"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                  />
                  <button
                    type="button"
                    onClick={addAllergy}
                    className="px-2.5 bg-amber-500 text-white rounded-lg text-xs font-bold"
                  >
                    إضافة
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-white border border-slate-100 rounded-xl">
                  {allergies.length === 0 && <span className="text-[10px] text-slate-400 p-1">خالٍ من الحساسية المعروفة</span>}
                  {allergies.map((a, i) => (
                    <span key={i} className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                      <span>{a}</span>
                      <button type="button" onClick={() => removeAllergy(i)} className="text-amber-400 hover:text-amber-600 font-extrabold text-[9px]">X</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-5 py-2.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء الاستمارة
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              حفظ وتسجيل المريض ✓
            </button>
          </div>
        </form>
      )}

      {/* Main split grid: Patient Directory and Selected Patient File Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Patient Directory List */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col max-h-[500px]">
          <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-50 pb-2">قائمة سجلات المرضى بالعيادة ({filteredPatients.length})</h3>
          
          <div className="overflow-y-auto space-y-2 pr-1 flex-grow">
            {filteredPatients.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">لا يوجد مرضى يطابقون شروط الفلترة الحالية.</div>
            ) : (
              filteredPatients.map(p => (
                <div
                  key={p.id}
                  onClick={() => setSelectedPatient(p)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    selectedPatient?.id === p.id 
                      ? 'bg-sky-50/50 border-sky-300 shadow-sm' 
                      : 'bg-white hover:bg-slate-50 border-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={p.photoUrl} 
                      alt={p.name} 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100 bg-slate-50 shrink-0" 
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150";
                      }}
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-none flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {!p.isActive && <span className="text-[8px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-black">خامل</span>}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">{p.id} | {p.phone}</span>
                    </div>
                  </div>

                  <div className="text-left font-mono shrink-0">
                    <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md block">
                      {p.totalSpent} ج.م
                    </span>
                    {p.outstandingBalance > 0 && (
                      <span className="text-[9px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded-md block mt-1">
                        عالق: {p.outstandingBalance}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Patient medical file details */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
          {selectedPatient ? (
            isEditingSelected ? (
              <form onSubmit={handleSaveSelectedEdit} className="space-y-6" dir="rtl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="font-black text-sm sm:text-base text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-sky-500" />
                    <span>تعديل السجل الطبي والبيانات للمريض: {selectedPatient.name}</span>
                  </h3>
                  <button 
                    type="button" 
                    onClick={() => setIsEditingSelected(false)}
                    className="text-rose-500 hover:text-rose-700 text-xs font-bold"
                  >
                    إلغاء التعديل [X]
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">الاسم الكامل للمريض *</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">رقم الهاتف الجوال *</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 font-mono text-left"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">فصيلة الدم</label>
                      <select
                        value={editBloodType}
                        onChange={(e) => setEditBloodType(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(b => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">حالة الحساب</label>
                      <select
                        value={editIsActive ? 'active' : 'inactive'}
                        onChange={(e) => setEditIsActive(e.target.value === 'active')}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500"
                      >
                        <option value="active">نشط</option>
                        <option value="inactive">خامل</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Insurance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                  {/* Emergency */}
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-xs text-indigo-600 border-b border-indigo-100 pb-1 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-500" />
                      <span>جهة اتصال الطوارئ (الأقرباء)</span>
                    </h4>
                    <div>
                      <label className="block text-[10px] text-slate-400">الاسم بالكامل</label>
                      <input
                        type="text"
                        value={editEmName}
                        onChange={(e) => setEditEmName(e.target.value)}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">الهاتف</label>
                      <input
                        type="text"
                        value={editEmPhone}
                        onChange={(e) => setEditEmPhone(e.target.value)}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-mono text-left"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">صلة القرابة</label>
                      <input
                        type="text"
                        value={editEmRelation}
                        onChange={(e) => setEditEmRelation(e.target.value)}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  {/* Insurance */}
                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-bold text-xs text-emerald-600 border-b border-emerald-100 pb-1 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-emerald-500" />
                      <span>التغطية والتأمين الصحي للمريض</span>
                    </h4>
                    <div>
                      <label className="block text-[10px] text-slate-400">الجهة المؤمنة</label>
                      <input
                        type="text"
                        value={editInsProvider}
                        onChange={(e) => setEditInsProvider(e.target.value)}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">رقم البوليصة</label>
                      <input
                        type="text"
                        value={editInsPolicy}
                        onChange={(e) => setEditInsPolicy(e.target.value)}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-400">نسبة الخصم المقررة (%)</label>
                      <input
                        type="number"
                        value={editInsDiscount}
                        onChange={(e) => setEditInsDiscount(Number(e.target.value))}
                        className="w-full px-2 py-1.5 mt-1 bg-white border border-slate-200 rounded-lg text-xs font-mono"
                        min="0"
                        max="100"
                      />
                    </div>
                  </div>
                </div>

                {/* Chronic conditions and allergies list with live editing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100">
                  {/* Conditions editing */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-500" />
                      <span>الأمراض المزمنة والمشاكل الصحية (اضغط Enter للإضافة)</span>
                    </h4>
                    
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="إضافة مشكلة صحية..."
                        value={editConditionInput}
                        onChange={(e) => setEditConditionInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (editConditionInput.trim()) {
                              setEditConditions([...editConditions, editConditionInput.trim()]);
                              setEditConditionInput('');
                            }
                          }
                        }}
                        className="flex-grow px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editConditionInput.trim()) {
                            setEditConditions([...editConditions, editConditionInput.trim()]);
                            setEditConditionInput('');
                          }
                        }}
                        className="px-3 py-1 bg-sky-500 text-white rounded-lg text-xs font-bold font-mono"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {editConditions.length === 0 ? (
                        <p className="text-[10px] text-slate-400">لا توجد مشاكل صحية مضافة.</p>
                      ) : (
                        editConditions.map((c, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-rose-700 font-bold bg-rose-50 px-2.5 py-1 rounded-lg">
                            <span>{c}</span>
                            <button
                              type="button"
                              onClick={() => setEditConditions(editConditions.filter((_, idx) => idx !== i))}
                              className="text-rose-500 hover:text-rose-950 px-1 font-black cursor-pointer"
                              title="حذف"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Allergies editing */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-amber-500" />
                      <span>الحساسيات الطبية والدوائية (اضغط Enter للإضافة)</span>
                    </h4>

                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="إضافة حساسية..."
                        value={editAllergyInput}
                        onChange={(e) => setEditAllergyInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (editAllergyInput.trim()) {
                              setEditAllergies([...editAllergies, editAllergyInput.trim()]);
                              setEditAllergyInput('');
                            }
                          }
                        }}
                        className="flex-grow px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (editAllergyInput.trim()) {
                            setEditAllergies([...editAllergies, editAllergyInput.trim()]);
                            setEditAllergyInput('');
                          }
                        }}
                        className="px-3 py-1 bg-sky-500 text-white rounded-lg text-xs font-bold font-mono"
                      >
                        +
                      </button>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {editAllergies.length === 0 ? (
                        <p className="text-[10px] text-slate-400">لا توجد حساسيات مضافة.</p>
                      ) : (
                        editAllergies.map((a, i) => (
                          <div key={i} className="flex justify-between items-center text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-lg">
                            <span>{a}</span>
                            <button
                              type="button"
                              onClick={() => setEditAllergies(editAllergies.filter((_, idx) => idx !== i))}
                              className="text-amber-500 hover:text-amber-950 px-1 font-black cursor-pointer"
                              title="حذف"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditingSelected(false)}
                    className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    إلغاء التعديل
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-emerald-500/10 cursor-pointer"
                  >
                    حفظ البيانات والملف الصحي للمريض ✓
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-6">
                
                {/* Patient File Header */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-4 border-b border-slate-100 pb-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-right">
                    <img 
                      src={selectedPatient.photoUrl} 
                      alt={selectedPatient.name} 
                      className="w-16 h-16 rounded-2xl object-cover border border-slate-200/80 shadow-md bg-slate-50"
                      onError={(e) => {
                        (e.target as any).src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150&h=150";
                      }}
                    />
                    <div>
                      <div className="flex items-center gap-2 justify-center sm:justify-start">
                        <h3 className="font-black text-slate-950 text-base sm:text-lg">{selectedPatient.name}</h3>
                        <span className="text-[9px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md font-bold font-mono">
                          {selectedPatient.id}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start font-mono">
                        <span>{selectedPatient.phone}</span>
                        <span>•</span>
                        <span>{selectedPatient.email}</span>
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 justify-center sm:justify-start">
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md font-bold">فصيلة: {selectedPatient.bloodType}</span>
                        <button
                          onClick={() => togglePatientActive(selectedPatient.id)}
                          className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-all ${
                            selectedPatient.isActive ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600' : 'bg-red-50 hover:bg-red-100 text-red-600'
                          }`}
                        >
                          الحالة: {selectedPatient.isActive ? 'نشط (تبديل لخامل)' : 'خامل (تبديل لنشط)'}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => startEditingSelected(selectedPatient)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-sky-500/10 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>تعديل السجل والبيانات 📝</span>
                    </button>

                    {onSelectPatientChart && (
                      <button
                        onClick={() => onSelectPatientChart(selectedPatient.id)}
                        className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-500/10 cursor-pointer"
                      >
                        <Activity className="w-4 h-4" />
                        <span>فتح مخطط الأسنان الطبي 🦷</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePatient(selectedPatient.id)}
                      className="px-4 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 text-center rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      حذف المريض نهائياً
                    </button>
                  </div>
                </div>

                {/* Financial Status Bento Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/40 text-center sm:text-right">
                    <span className="text-[10px] text-emerald-600 font-bold block">إجمالي الإنفاق</span>
                    <strong className="text-base sm:text-lg text-emerald-700 font-mono block mt-1">{selectedPatient.totalSpent} ج.م</strong>
                  </div>

                  <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100/40 text-center sm:text-right">
                    <span className="text-[10px] text-rose-600 font-bold block">الرصيد العالق (المتبقي)</span>
                    <strong className="text-base sm:text-lg text-rose-700 font-mono block mt-1">{selectedPatient.outstandingBalance} ج.م</strong>
                  </div>

                  <div className="bg-sky-50/50 p-3 rounded-2xl border border-sky-100/40 text-center sm:text-right col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-sky-600 font-bold block">آخر زيارة مسجلة</span>
                    <strong className="text-xs sm:text-sm text-sky-700 font-mono block mt-2">{selectedPatient.lastVisit || 'لا توجد زيارات'}</strong>
                  </div>
                </div>

                {/* Patient Profile Tabs (Health details, contact details, insurance details) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  
                  {/* Health details */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4 text-rose-500" />
                        <span>الحالات المرضية والأمراض المزمنة</span>
                      </h4>
                      <ul className="mt-2.5 space-y-1.5">
                        {selectedPatient.medicalConditions.length === 0 ? (
                          <li className="text-[11px] text-slate-400">لا توجد حالات صحية مزمنة معلنة ✓</li>
                        ) : (
                          selectedPatient.medicalConditions.map((c, i) => (
                            <li key={i} className="text-xs text-rose-600 font-bold bg-rose-50/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                              <span>{c}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Heart className="w-4 h-4 text-amber-500" />
                        <span>الحساسيات الطبية الدوائية</span>
                      </h4>
                      <ul className="mt-2.5 space-y-1.5">
                        {selectedPatient.allergies.length === 0 ? (
                          <li className="text-[11px] text-slate-400">خالٍ تماماً من الحساسيات الطبية ✓</li>
                        ) : (
                          selectedPatient.allergies.map((a, i) => (
                            <li key={i} className="text-xs text-amber-600 font-bold bg-amber-50/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              <span>{a}</span>
                            </li>
                          ))
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Emergency Contact & Insurance detail */}
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-500" />
                        <span>جهة اتصال الطوارئ (الأقرباء)</span>
                      </h4>
                      <div className="mt-2.5 space-y-2 text-xs">
                        <p className="text-slate-600">الاسم: <strong className="text-slate-900">{selectedPatient.emergencyContact?.name || 'غير محدد'}</strong></p>
                        <p className="text-slate-600">الهاتف: <strong className="text-slate-900 font-mono">{selectedPatient.emergencyContact?.phone || 'غير محدد'}</strong></p>
                        <p className="text-slate-600">صلة القرابة: <strong className="text-slate-900">{selectedPatient.emergencyContact?.relation || 'غير محدد'}</strong></p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <h4 className="font-black text-xs text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Mail className="w-4 h-4 text-emerald-500" />
                        <span>التغطية والتأمين الصحي للمريض</span>
                      </h4>
                      <div className="mt-2.5 space-y-2 text-xs">
                        <p className="text-slate-600">الجهة المؤمنة: <strong className="text-slate-900">{selectedPatient.insurance?.provider || 'نقدي (لا يوجد)'}</strong></p>
                        {selectedPatient.insurance?.policyNumber && (
                          <p className="text-slate-600">رقم البوليصة: <strong className="text-slate-900 font-mono">{selectedPatient.insurance.policyNumber}</strong></p>
                        )}
                        <p className="text-slate-600">نسبة الخصم المقررة: <strong className="text-emerald-600 font-black font-mono">{selectedPatient.insurance?.discountPercent || 0}% خصم</strong></p>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            )
          ) : (
            <div className="h-96 flex flex-col items-center justify-center text-center text-slate-400">
              <User className="w-16 h-16 text-slate-200 mb-4" />
              <h3 className="font-bold text-sm text-slate-700">لم يتم اختيار أي مريض للمعاينة</h3>
              <p className="text-[11px] text-slate-400 mt-1 max-w-xs">يرجى الضغط على أي مريض من قائمة السجلات لعرض استمارته الطبية بالكامل، نسب الإنفاق، الاتصال بالطوارئ وتغطية التأمين.</p>
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
                نعم، متأكد وحذف 🗑️
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
