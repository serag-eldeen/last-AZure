import React, { useState } from 'react';
import { 
  Plus, Check, Trash2, Calendar, DollarSign, RefreshCw, Filter, 
  Package, Archive, AlertCircle, ShoppingCart, Sliders, ChevronDown, 
  ChevronUp, ShieldCheck, Layers, FileText, Search, Edit 
} from 'lucide-react';
import { InventoryItem, InventoryCategory, StockStatus } from '../../adminTypes';
import { getInventory, saveInventory, addNotification, deleteInventory } from '../../clinicDb';

interface InventoryTabProps {
  triggerRefresh: () => void;
}

const CATEGORY_LABELS: Record<InventoryCategory, string> = {
  Supplies: 'مواد ومستهلكات طبية',
  Instruments: 'أدوات ومعدات عيادة',
  Implants: 'زرعات وأطقم تركيبات',
  Disinfectants: 'مطهرات ومواد تعقيم',
  'Personal Protective Equipment': 'معدات وقاية شخصية (PPE)',
  Miscellaneous: 'موارد عامة ونثرية'
};

export default function InventoryTab({ triggerRefresh }: InventoryTabProps) {
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInventory());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // New Item Form
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<InventoryCategory>('Supplies');
  const [sku, setSku] = useState('');
  const [quantity, setQuantity] = useState(10);
  const [minQuantity, setMinQuantity] = useState(3);
  const [supplier, setSupplier] = useState('');
  const [unitPrice, setUnitPrice] = useState(150);
  const [expirationDate, setExpirationDate] = useState('2027-12-31');
  const [storageLocation, setStorageLocation] = useState<'Cabinet A' | 'Cabinet B' | 'Shelf 1' | 'Shelf 2'>('Cabinet A');

  // Custom Confirm Dialog State
  const [confirmAction, setConfirmAction] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  const refreshData = () => {
    setInventory(getInventory());
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || quantity < 0 || unitPrice <= 0 || !supplier.trim()) {
      alert('الرجاء ملء حقول المستودع المطلوبة بشكل سليم.');
      return;
    }

    const calculatedSku = sku.trim() || 'DENT-' + Math.floor(1000 + Math.random() * 9000);

    // Stock Status calculation
    let status: StockStatus = 'In Stock';
    if (quantity === 0) status = 'Out of Stock';
    else if (quantity <= minQuantity) status = 'Low Stock';

    const newItem: InventoryItem = {
      id: 'INV-' + Math.floor(100000 + Math.random() * 900000).toString(),
      name: name.trim(),
      category,
      sku: calculatedSku,
      quantity: Number(quantity),
      minQuantity: Number(minQuantity),
      supplier: supplier.trim(),
      unitPrice: Number(unitPrice),
      expirationDate,
      storageLocation,
      status,
      createdAt: new Date().toISOString()
    };

    const currentList = getInventory();
    currentList.unshift(newItem);
    saveInventory(currentList);

    // Add alert notification if the item is instantly low stock
    if (status === 'Low Stock' || status === 'Out of Stock') {
      addNotification(
        'Inventory',
        'High',
        `تنبيه نقص مخزون: ${name.trim()}`,
        `المادة الطبية ${name.trim()} تحت خط الأمان المقدر بـ ${minQuantity} وحدة.`
      );
    }

    // Reset Form
    setName('');
    setCategory('Supplies');
    setSku('');
    setQuantity(10);
    setMinQuantity(3);
    setSupplier('');
    setUnitPrice(150);
    setExpirationDate('2027-12-31');
    setStorageLocation('Cabinet A');
    setShowAddForm(false);

    refreshData();
    triggerRefresh();
  };

  const handleAdjustQuantity = (id: string, amount: number) => {
    const currentList = getInventory();
    const updated = currentList.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + amount);
        
        let status: StockStatus = 'In Stock';
        if (newQty === 0) status = 'Out of Stock';
        else if (newQty <= item.minQuantity) status = 'Low Stock';

        // Trigger notifications if falling below minimum
        if (newQty <= item.minQuantity && item.quantity > item.minQuantity) {
          addNotification(
            'Inventory',
            'High',
            `تحذير مخزون حرج: ${item.name}`,
            `انخفض رصيد المادة ${item.name} في المستودع إلى ${newQty} وحدات متبقية.`
          );
        }

        return {
          ...item,
          quantity: newQty,
          status
        };
      }
      return item;
    });

    saveInventory(updated);
    setInventory(updated);
    triggerRefresh();
  };

  const handleDeleteItem = (id: string) => {
    setConfirmAction({
      message: 'هل أنت متأكد من حذف هذه المادة بالكامل من جرد المستودع الطبي؟ لا يمكن استرجاع المادة المحذوفة.',
      onConfirm: () => {
        deleteInventory(id);
        refreshData();
        triggerRefresh();
      }
    });
  };

  // Filtered List Compiler
  const filteredInventory = inventory.filter(item => {
    const query = search.toLowerCase();
    const matchesSearch = 
      item.name.toLowerCase().includes(query) || 
      item.sku.toLowerCase().includes(query) ||
      item.supplier.toLowerCase().includes(query);

    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter !== 'all') {
      matchesStatus = item.status === statusFilter;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI calculations
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockCount = inventory.filter(item => item.status === 'Low Stock' || item.status === 'Out of Stock').length;
  const totalUniqueSkus = inventory.length;

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block uppercase">القيمة الإجمالية للمخزون المتاح</span>
            <strong className="text-xl text-emerald-600 font-mono font-black">{totalStockValue} ج.م</strong>
            <span className="text-[9px] text-slate-400 block mt-0.5">القيمة المالية الكلية لجميع المواد الطبية</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block uppercase">المواد والقطع الطبية الفريدة</span>
            <strong className="text-xl text-slate-800 font-mono font-black">{totalUniqueSkus} صنف</strong>
            <span className="text-[9px] text-slate-400 block mt-0.5">عدد البنود الطبية واللوازم المسجلة بالجرد</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-black text-slate-400 block uppercase">تنبيهات الأصناف الحرجة ونفاد الرصيد</span>
            <strong className={`text-xl font-mono font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>{lowStockCount} تنبيه</strong>
            <span className="text-[9px] text-slate-400 block mt-0.5">أصناف شارفت على النفاد أو بحاجة لإعادة الشراء</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Control bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث بالاسم، SKU أو المورد..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pr-9 pl-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:outline-none"
            />
            <Search className="absolute right-3 top-2.5 w-4 h-4 text-slate-400" />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل التصنيفات الطبية</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 focus:outline-none"
          >
            <option value="all">كل مستويات المخزون</option>
            <option value="In Stock">متوفر بالمخزن</option>
            <option value="Low Stock">مخزون حرج</option>
            <option value="Out of Stock">نافد بالكامل</option>
          </select>
        </div>

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
            <span>إضافة صنف جرد جديد</span>
          </button>
        </div>

      </div>

      {/* Add Item form */}
      {showAddForm && (
        <form onSubmit={handleCreateItem} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-4">
          <h3 className="font-black text-sm text-slate-800 border-b border-slate-100 pb-2.5 flex items-center gap-2">
            <Archive className="w-5 h-5 text-sky-500" />
            <span>إضافة وتسجيل مادة طبية جديدة للمستودع عيادي</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">اسم الصنف / المادة الطبية *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: قطن جراحي معقم كروي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">تصنيف المادة ومستواها</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as InventoryCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">رمز الباركود / SKU (تلقائي لو فارغ)</label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="أدخل باركود أو اتركه فارغاً..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">المورد الرئيسي / جهة التوريد *</label>
              <input
                type="text"
                required
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                placeholder="مثال: شركة تكنو دينت مصر للأسنان"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">الكمية الحالية المتوفرة *</label>
              <input
                type="number"
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-emerald-700"
                min="0"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">الحد الأدنى للأمان (تنبيه نقص)</label>
              <input
                type="number"
                required
                value={minQuantity}
                onChange={(e) => setMinQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-amber-600"
                min="1"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">سعر شراء الوحدة (ج.م) *</label>
              <input
                type="number"
                required
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-center font-bold text-slate-700"
                min="1"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ انتهاء الصلاحية</label>
              <input
                type="date"
                required
                value={expirationDate}
                onChange={(e) => setExpirationDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">مكان التخزين بالعيادة</label>
              <select
                value={storageLocation}
                onChange={(e: any) => setStorageLocation(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Cabinet A">دولاب الأدوية الرئيسي (دولاب أ)</option>
                <option value="Cabinet B">خزانة مستهلكات الأسنان (دولاب ب)</option>
                <option value="Shelf 1">الرف العلوي - غرفة رقم 1</option>
                <option value="Shelf 2">الرف المعقم السفلي</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold"
            >
              إلغاء الإضافة
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold"
            >
              تأكيد وتثبيت جرد الصنف ✓
            </button>
          </div>
        </form>
      )}

      {/* Grid List of Inventory Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredInventory.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center text-slate-400 text-xs">لا توجد مواد تطابق خيارات التصفية النشطة بالبحث.</div>
        ) : (
          filteredInventory.map(item => (
            <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4 hover:border-slate-200 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-black text-slate-400 font-mono tracking-wider">{item.sku}</span>
                  <h4 className="font-black text-slate-900 text-sm">{item.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-1">المورد: {item.supplier}</p>
                </div>

                <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                  item.status === 'In Stock' ? 'bg-emerald-50 text-emerald-700' :
                  item.status === 'Low Stock' ? 'bg-amber-50 text-amber-700 animate-pulse' : 'bg-red-50 text-red-600'
                }`}>
                  {item.status === 'In Stock' ? 'متوفر بالمخزن' :
                   item.status === 'Low Stock' ? 'مخزون حرج!' : 'نفاد تماماً 🚨'}
                </span>
              </div>

              {/* Item stats */}
              <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50/50 rounded-2xl text-[10px] text-slate-500">
                <div>
                  <span className="block text-slate-400 mb-0.5">سعر الوحدة</span>
                  <strong className="text-slate-800 font-mono font-bold">{item.unitPrice} ج.م</strong>
                </div>
                <div>
                  <span className="block text-slate-400 mb-0.5">مكان التخزين</span>
                  <strong className="text-indigo-600 font-bold">{item.storageLocation}</strong>
                </div>
                <div>
                  <span className="block text-slate-400 mb-0.5">الصلاحية لغاية</span>
                  <strong className="text-slate-800 font-mono font-bold">{item.expirationDate}</strong>
                </div>
              </div>

              {/* Stock controls */}
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">المخزون المتوفر حالياً:</span>
                  <strong className="text-sm text-slate-800 font-mono">{item.quantity} وحدة</strong>
                  <span className="text-[9px] text-slate-400 font-bold block mt-0.5">الحد الآمن: {item.minQuantity}</span>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => handleAdjustQuantity(item.id, -1)}
                    className="w-7 h-7 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm font-black flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => handleAdjustQuantity(item.id, 1)}
                    className="w-7 h-7 bg-white text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm font-black flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="w-7 h-7 hover:bg-red-50 text-red-500 rounded-lg flex items-center justify-center cursor-pointer ml-1"
                    title="حذف الصنف"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
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
