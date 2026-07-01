import React, { useState, useEffect } from 'react';
import { 
  User, Check, Heart, ShieldAlert, Award, Calendar, Activity, 
  HelpCircle, Eye, RefreshCw, FileText, Plus, Info 
} from 'lucide-react';
import { DentalChart, ToothState, ToothCondition, ToothSurfaces, ExtendedPatient } from '../../adminTypes';
import { getPatients, getPatientChart, saveDentalCharts, getDentalCharts } from '../../clinicDb';

interface DentalChartTabProps {
  initialPatientId?: string;
  triggerRefresh: () => void;
}

const CONDITIONS_INFO: Record<ToothCondition, { label: string; color: string; bg: string }> = {
  Healthy: { label: 'سليم', color: 'text-emerald-600', bg: 'bg-emerald-500' },
  Cavity: { label: 'تسوس / نخر', color: 'text-rose-600', bg: 'bg-rose-500' },
  Filling: { label: 'حشو تجميلي', color: 'text-sky-600', bg: 'bg-sky-500' },
  'Root Canal': { label: 'حشو عصب', color: 'text-purple-600', bg: 'bg-purple-500' },
  Extraction: { label: 'بحاجة لخلع', color: 'text-amber-600', bg: 'bg-amber-500' },
  Crown: { label: 'تاج / تلبيسة', color: 'text-indigo-600', bg: 'bg-indigo-500' },
  Bridge: { label: 'جسر أسنان', color: 'text-teal-600', bg: 'bg-teal-500' },
  Implant: { label: 'زراعة سن', color: 'text-blue-600', bg: 'bg-blue-500' },
  Orthodontics: { label: 'تقويم أسنان', color: 'text-pink-600', bg: 'bg-pink-500' },
  Missing: { label: 'مفقود / خلع سابق', color: 'text-slate-500', bg: 'bg-slate-400' }
};

export function getToothDisplayLabel(num: number): string {
  // Adult upper: 1 to 16
  if (num >= 1 && num <= 8) {
    return (9 - num).toString(); // 1->8, 2->7, ..., 8->1
  }
  if (num >= 9 && num <= 16) {
    return (num - 8).toString(); // 9->1, 10->2, ..., 16->8
  }
  // Adult lower: 17 to 32
  // We rendered lower teeth in order: 32 down to 17
  // Let's map LR: 32 down to 25 -> 8 down to 1
  if (num >= 25 && num <= 32) {
    return (num - 24).toString(); // 25->1, 26->2, ..., 32->8
  }
  // Let's map LL: 24 down to 17 -> 1 to 8
  if (num >= 17 && num <= 24) {
    return (25 - num).toString(); // 24->1, 23->2, ..., 17->8
  }

  // Child: 51-55, 61-65, 71-75, 81-85
  // Map A-E
  const childMap: Record<number, string> = {
    55: 'E', 54: 'D', 53: 'C', 52: 'B', 51: 'A',
    61: 'A', 62: 'B', 63: 'C', 64: 'D', 65: 'E',
    85: 'E', 84: 'D', 83: 'C', 82: 'B', 81: 'A',
    71: 'A', 72: 'B', 73: 'C', 74: 'D', 75: 'E'
  };

  return childMap[num] || num.toString();
}

export default function DentalChartTab({ initialPatientId, triggerRefresh }: DentalChartTabProps) {
  const [patients] = useState<ExtendedPatient[]>(() => getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId || '');
  const [isChild, setIsChild] = useState(false);
  const [chart, setChart] = useState<DentalChart | null>(null);

  // Active Selected Tooth for editing
  const [selectedToothNum, setSelectedToothNum] = useState<number | null>(null);
  const [toothCondition, setToothCondition] = useState<ToothCondition>('Healthy');
  const [toothSurfaces, setToothSurfaces] = useState<ToothSurfaces>({
    top: false, bottom: false, left: false, right: false, center: false
  });
  const [toothNotes, setToothNotes] = useState('');
  const [treatmentDate, setTreatmentDate] = useState('');

  useEffect(() => {
    if (initialPatientId) {
      setSelectedPatientId(initialPatientId);
    }
  }, [initialPatientId]);

  useEffect(() => {
    if (selectedPatientId) {
      const pChart = getPatientChart(selectedPatientId, isChild);
      setChart(pChart);
      setSelectedToothNum(null);
    } else {
      setChart(null);
    }
  }, [selectedPatientId, isChild]);

  const handleSelectTooth = (num: number) => {
    if (!chart) return;
    setSelectedToothNum(num);
    const tooth = chart.teeth[num] || {
      toothNumber: num,
      condition: 'Healthy',
      surfaces: { top: false, bottom: false, left: false, right: false, center: false },
      notes: '',
      treatmentDate: ''
    };

    setToothCondition(tooth.condition);
    setToothSurfaces({ ...tooth.surfaces });
    setToothNotes(tooth.notes || '');
    setTreatmentDate(tooth.treatmentDate || new Date().toISOString().slice(0, 10));
  };

  const handleSaveToothEdits = () => {
    if (!chart || selectedToothNum === null) return;

    const updatedTeeth = { ...chart.teeth };
    updatedTeeth[selectedToothNum] = {
      toothNumber: selectedToothNum,
      condition: toothCondition,
      surfaces: toothSurfaces,
      notes: toothNotes,
      treatmentDate: treatmentDate || undefined
    };

    const allCharts = getDentalCharts();
    allCharts[selectedPatientId] = {
      ...chart,
      teeth: updatedTeeth
    };

    saveDentalCharts(allCharts);
    setChart({ ...chart, teeth: updatedTeeth });
    setSelectedToothNum(null);
    triggerRefresh();
  };

  const toggleSurface = (surf: keyof ToothSurfaces) => {
    setToothSurfaces(prev => ({ ...prev, [surf]: !prev[surf] }));
  };

  // Adult Upper & Lower Arches split
  const adultUpperTeeth = Array.from({ length: 16 }, (_, i) => i + 1); // 1 to 16
  const adultLowerTeeth = Array.from({ length: 16 }, (_, i) => 32 - i); // 32 down to 17 (mirroring arch)

  // Child Upper & Lower Arches split (51-55, 61-65, 71-75, 81-85)
  const childUpperTeeth = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
  const childLowerTeeth = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];

  const currentUpperTeeth = isChild ? childUpperTeeth : adultUpperTeeth;
  const currentLowerTeeth = isChild ? childLowerTeeth : adultLowerTeeth;

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  return (
    <div className="space-y-6" dir="rtl">
      
      {/* Patient Selector Strip */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="w-full">
            <label className="block text-[10px] font-bold text-slate-400 mb-0.5">اختر المريض لعرض المخطط الطبي</label>
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
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setIsChild(false)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isChild ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              مخطط البالغين (32 سن)
            </button>
            <button
              onClick={() => setIsChild(true)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isChild ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-950'
              }`}
            >
              مخطط الأطفال (20 سن)
            </button>
          </div>
        )}
      </div>

      {chart ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Dental Chart Diagram */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="font-black text-xs text-slate-400 uppercase tracking-wider">مخطط الأسنان التفاعلي للمريض: <span className="text-slate-800 font-bold">{selectedPatient?.name}</span></h3>
              <div className="flex gap-2 text-[10px] text-slate-400">
                <span>🦷 انقر على أي سن لفتح معالج العلاج والأسطح</span>
              </div>
            </div>

            {/* upper arch */}
            <div className="space-y-3">
              <div className="text-center text-[10px] text-slate-400 font-black tracking-widest bg-slate-50/50 py-1 rounded-lg">الصف العلوي (MAXILLARY ARCH)</div>
              <div className="flex flex-wrap justify-center gap-2">
                {currentUpperTeeth.map(num => {
                  const tooth = (chart.teeth[num] || { condition: 'Healthy' }) as any;
                  const isSelected = selectedToothNum === num;
                  const cond = CONDITIONS_INFO[tooth.condition as ToothCondition] || CONDITIONS_INFO.Healthy;

                  return (
                    <button
                      key={num}
                      onClick={() => handleSelectTooth(num)}
                      className={`w-12 p-1.5 rounded-xl border transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105' 
                          : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
                      }`}
                    >
                      <span className="font-mono text-sm font-black text-slate-800 leading-none">{getToothDisplayLabel(num)}</span>
                      <span className="font-mono text-[8px] text-slate-400 mt-0.5">#{num}</span>
                      
                      {/* Micro 5-surface SVG Representation */}
                      <svg className="w-6 h-6 my-1" viewBox="0 0 24 24">
                        {/* Top surface */}
                        <path d="M4 4 L20 4 L16 8 L8 8 Z" className={`${tooth.surfaces?.top ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        {/* Bottom surface */}
                        <path d="M4 20 L20 20 L16 16 L8 16 Z" className={`${tooth.surfaces?.bottom ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        {/* Left surface */}
                        <path d="M4 4 L4 20 L8 16 L8 8 Z" className={`${tooth.surfaces?.left ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        {/* Right surface */}
                        <path d="M20 4 L20 20 L16 16 L16 8 Z" className={`${tooth.surfaces?.right ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        {/* Center surface */}
                        <rect x="8" y="8" width="8" height="8" className={`${tooth.surfaces?.center ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                      </svg>

                      <div className={`w-2.5 h-2.5 rounded-full ${cond.bg}`} title={cond.label} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* lower arch */}
            <div className="space-y-3 pt-4 border-t border-slate-50">
              <div className="text-center text-[10px] text-slate-400 font-black tracking-widest bg-slate-50/50 py-1 rounded-lg">الصف السفلي (MANDIBULAR ARCH)</div>
              <div className="flex flex-wrap justify-center gap-2">
                {currentLowerTeeth.map(num => {
                  const tooth = (chart.teeth[num] || { condition: 'Healthy' }) as any;
                  const isSelected = selectedToothNum === num;
                  const cond = CONDITIONS_INFO[tooth.condition as ToothCondition] || CONDITIONS_INFO.Healthy;

                  return (
                    <button
                      key={num}
                      onClick={() => handleSelectTooth(num)}
                      className={`w-12 p-1.5 rounded-xl border transition-all flex flex-col items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 shadow-md scale-105' 
                          : 'border-slate-100 hover:border-slate-200 bg-white shadow-sm'
                      }`}
                    >
                      <span className="font-mono text-sm font-black text-slate-800 leading-none">{getToothDisplayLabel(num)}</span>
                      <span className="font-mono text-[8px] text-slate-400 mt-0.5">#{num}</span>
                      
                      {/* Micro 5-surface SVG */}
                      <svg className="w-6 h-6 my-1" viewBox="0 0 24 24">
                        <path d="M4 4 L20 4 L16 8 L8 8 Z" className={`${tooth.surfaces?.top ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        <path d="M4 20 L20 20 L16 16 L8 16 Z" className={`${tooth.surfaces?.bottom ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        <path d="M4 4 L4 20 L8 16 L8 8 Z" className={`${tooth.surfaces?.left ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        <path d="M20 4 L20 20 L16 16 L16 8 Z" className={`${tooth.surfaces?.right ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                        <rect x="8" y="8" width="8" height="8" className={`${tooth.surfaces?.center ? 'fill-sky-400' : 'fill-slate-100'} stroke-slate-300 stroke-[0.5]`} />
                      </svg>

                      <div className={`w-2.5 h-2.5 rounded-full ${cond.bg}`} title={cond.label} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conditions Legend Block */}
            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-4 text-xs">
              {Object.entries(CONDITIONS_INFO).map(([key, info]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className={`w-3.5 h-3.5 rounded-lg ${info.bg} shrink-0`} />
                  <span className="font-bold text-slate-700">{info.label}</span>
                </div>
              ))}
            </div>

          </div>

          {/* Tooth Treatment Form / details panel */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
            {selectedToothNum !== null ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                  <h4 className="font-black text-slate-900 text-sm">تعديل حالة السن الرقمي: #{selectedToothNum} (الرمز: {getToothDisplayLabel(selectedToothNum)})</h4>
                  <button onClick={() => setSelectedToothNum(null)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">[X] إلغاء</button>
                </div>

                {/* Condition Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">الحالة الإكلينيكية للسن</label>
                  <select
                    value={toothCondition}
                    onChange={(e) => setToothCondition(e.target.value as ToothCondition)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
                  >
                    {Object.entries(CONDITIONS_INFO).map(([key, value]) => (
                      <option key={key} value={key}>{value.label}</option>
                    ))}
                  </select>
                </div>

                {/* Surface selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-2">أسطح السن المتأثرة بالعلاج (اضغط للتحديد)</label>
                  
                  <div className="flex justify-center my-4">
                    {/* Visual Interactive SVG Surfaces Selector */}
                    <svg className="w-32 h-32" viewBox="0 0 100 100">
                      {/* Top surface */}
                      <path 
                        d="M10 10 L90 10 L70 30 L30 30 Z" 
                        onClick={() => toggleSurface('top')}
                        className={`cursor-pointer transition-all stroke-slate-400 stroke-[1] ${
                          toothSurfaces.top ? 'fill-sky-500 hover:fill-sky-600' : 'fill-slate-100 hover:fill-slate-200'
                        }`} 
                      />
                      <text x="50" y="22" textAnchor="middle" className="text-[7px] font-black pointer-events-none fill-slate-500">سقف (O/I)</text>

                      {/* Bottom surface */}
                      <path 
                        d="M10 90 L90 90 L70 70 L30 70 Z" 
                        onClick={() => toggleSurface('bottom')}
                        className={`cursor-pointer transition-all stroke-slate-400 stroke-[1] ${
                          toothSurfaces.bottom ? 'fill-sky-500 hover:fill-sky-600' : 'fill-slate-100 hover:fill-slate-200'
                        }`} 
                      />
                      <text x="50" y="82" textAnchor="middle" className="text-[7px] font-black pointer-events-none fill-slate-500">قاع (L/P)</text>

                      {/* Left surface */}
                      <path 
                        d="M10 10 L10 90 L30 70 L30 30 Z" 
                        onClick={() => toggleSurface('left')}
                        className={`cursor-pointer transition-all stroke-slate-400 stroke-[1] ${
                          toothSurfaces.left ? 'fill-sky-500 hover:fill-sky-600' : 'fill-slate-100 hover:fill-slate-200'
                        }`} 
                      />
                      <text x="21" y="52" textAnchor="middle" className="text-[7px] font-black pointer-events-none fill-slate-500">أيسر (M)</text>

                      {/* Right surface */}
                      <path 
                        d="M90 10 L90 90 L70 70 L70 30 Z" 
                        onClick={() => toggleSurface('right')}
                        className={`cursor-pointer transition-all stroke-slate-400 stroke-[1] ${
                          toothSurfaces.right ? 'fill-sky-500 hover:fill-sky-600' : 'fill-slate-100 hover:fill-slate-200'
                        }`} 
                      />
                      <text x="80" y="52" textAnchor="middle" className="text-[7px] font-black pointer-events-none fill-slate-500">أيمن (D)</text>

                      {/* Center surface */}
                      <rect 
                        x="30" y="30" width="40" height="40" 
                        onClick={() => toggleSurface('center')}
                        className={`cursor-pointer transition-all stroke-slate-400 stroke-[1] ${
                          toothSurfaces.center ? 'fill-sky-500 hover:fill-sky-600' : 'fill-slate-100 hover:fill-slate-200'
                        }`} 
                      />
                      <text x="50" y="52" textAnchor="middle" className="text-[7px] font-black pointer-events-none fill-slate-500">مركز (B/L)</text>
                    </svg>
                  </div>
                </div>

                {/* Treatment Notes */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">ملاحظات وتقرير السن الطبي</label>
                  <textarea
                    rows={2}
                    value={toothNotes}
                    onChange={(e) => setToothNotes(e.target.value)}
                    placeholder="اكتب نوع الحشوة، الماركة، أو أي إجراءات متبعة بالتحديد..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>

                {/* Treatment date */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">تاريخ معالجة السن</label>
                  <input
                    type="date"
                    value={treatmentDate}
                    onChange={(e) => setTreatmentDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSaveToothEdits}
                    className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                  >
                    حفظ وإغلاق معالجة السن ✓
                  </button>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-12">
                <HelpCircle className="w-16 h-16 text-slate-100 mb-4 animate-pulse" />
                <h4 className="font-black text-xs text-slate-700">لم يتم تحديد سن للمعاينة والتعديل</h4>
                <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">يرجى الضغط على أي سن في المخطط المقابل لعرض وتعديل حالته الطبية، وتحديد أسطح السن الـ 5 التي تم علاجها بدقة.</p>
              </div>
            )}
          </div>

        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center text-slate-400">
          <Activity className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="font-bold text-sm text-slate-700">مخطط الأسنان مغلق</h3>
          <p className="text-[11px] text-slate-400 mt-1">الرجاء اختيار مريض من شريط البحث في الأعلى لمشاهدة وتعديل مخططه السني التفاعلي.</p>
        </div>
      )}

    </div>
  );
}
