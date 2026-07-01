import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Smile, ShieldCheck, HeartHandshake, HelpCircle, 
  ChevronLeft, ChevronRight, Activity, Zap, CreditCard, Flame,
  Stethoscope, Compass, RefreshCw, Trophy, ArrowLeft
} from 'lucide-react';
import { SERVICES, DOCTORS } from '../data';

interface SmileStudioProps {
  onOpenBooking: (serviceId?: string) => void;
}

export default function SmileStudio({ onOpenBooking }: SmileStudioProps) {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<string | null>(null);
  const [priority, setPriority] = useState<string | null>(null);
  const [prefDoctor, setPrefDoctor] = useState<string | null>(null);

  const handleRestart = () => {
    setStep(1);
    setGoal(null);
    setPriority(null);
    setPrefDoctor(null);
  };

  const getRecommendation = () => {
    // Basic recommendation rules
    let recommendedServiceId = 'hollywood-smile';
    let reasoning = 'بناءً على اختيارك للجمالية والبياض، فإن فينير الإيماكس وتصميم الابتسامة الرقمي هو الحل الأمثل لابتسامة طبيعية فائقة النقاء.';

    if (goal === 'alignment') {
      recommendedServiceId = 'orthodontics';
      reasoning = 'لتعديل الفراغات والاعوجاج، فإن التقويم الشفاف غير المرئي هو الخيار الأكثر راحة وأناقة لتعديل اصطفاف أسنانك.';
    } else if (goal === 'implants') {
      recommendedServiceId = 'dental-implants';
      reasoning = 'لتعويض السن المفقود بمتانة دائمية، نوصي بزراعة التيتانيوم الرقمية الفورية التي تندمج مع العظام بدون آلام.';
    } else if (goal === 'painless') {
      recommendedServiceId = 'root-canal';
      reasoning = 'لعلاج الآلام العميقة وحماية السن الطبيعي فوراً، ننصح بحشو العصب الفوري باستخدام أجهزة الـ Rotary والميكروسكوب في جلسة واحدة خالية من الألم.';
    } else if (goal === 'cosmetic') {
      recommendedServiceId = 'cosmetic-fillings';
      reasoning = 'للتسوسات البسيطة والتجميل السريع، ننصح بالحشوات التجميلية المتطابقة تماماً مع لون المينا الطبيعي.';
    }

    const service = SERVICES.find(s => s.id === recommendedServiceId) || SERVICES[5];
    
    // Pick recommended doctor matching the specialty if not specified
    let doctorName = 'د. باسل المرسي';
    let doctorId = 'dr-basel';
    
    if (recommendedServiceId === 'dental-implants' || recommendedServiceId === 'root-canal') {
      doctorName = 'د. عمرو العدوي';
      doctorId = 'dr-amr';
    }

    if (prefDoctor === 'dr-amr') {
      doctorName = 'د. عمرو العدوي';
      doctorId = 'dr-amr';
    } else if (prefDoctor === 'dr-basel') {
      doctorName = 'د. باسل المرسي';
      doctorId = 'dr-basel';
    }

    return {
      service,
      doctorName,
      doctorId,
      reasoning
    };
  };

  const recommendation = getRecommendation();

  return (
    <section 
      id="smile-studio"
      className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 text-white relative overflow-hidden"
    >
      {/* Radiant ambient glow effects */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold font-sans">
            <Compass className="w-3.5 h-3.5" />
            <span>مستشار تصميم الابتسامة الذكي</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            صمّم خطتك العلاجية في أقل من دقيقة
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            استخدم مستشارنا التفاعلي الذكي لتحديد المشاكل العلاجية أو الأهداف التجميلية التي تبحث عنها، واحصل فوراً على الإجراء الطبي المناسب والطبيب المختص لك.
          </p>
        </div>

        {/* Studio Widget Panel Container */}
        <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 rounded-[36px] p-6 sm:p-10 shadow-2xl relative overflow-hidden" dir="rtl">
          
          {/* Subtle background lines */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

          {/* Progress Indicator */}
          {step <= 3 && (
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/60 relative z-10">
              <span className="text-xs font-bold text-sky-400 font-mono">الخطوة {step} من 3</span>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step >= s ? 'w-8 bg-sky-500' : 'w-2 bg-slate-800'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Form Wizard Pages using AnimatePresence */}
          <div className="relative z-10 min-h-[250px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: Main Goal selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6 text-right"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block shrink-0" />
                    ما هو الهدف الأساسي الذي تود تحقيقه لأسنانك؟
                  </h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      id="opt-goal-whitening"
                      onClick={() => { setGoal('whitening'); setStep(2); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        goal === 'whitening' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-sky-500/10 text-sky-400 rounded-xl shrink-0"><Sparkles className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">تبييض فوري وتعديل المظهر (هوليود سمايل)</h4>
                        <p className="text-xs text-slate-400 mt-1">تعديل لون وشكل الأسنان الأمامية بقشور الزيركون والإيماكس والعدسات.</p>
                      </div>
                    </button>

                    <button
                      id="opt-goal-alignment"
                      onClick={() => { setGoal('alignment'); setStep(2); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        goal === 'alignment' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl shrink-0"><Smile className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">تعديل اصطفاف الفك وعلاج الاعوجاج</h4>
                        <p className="text-xs text-slate-400 mt-1">تقويم معدني أو شفاف غير مرئي لتنسيق مظهر الابتسامة الطبيعي.</p>
                      </div>
                    </button>

                    <button
                      id="opt-goal-implants"
                      onClick={() => { setGoal('implants'); setStep(2); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        goal === 'implants' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0"><Activity className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">تعويض سن مفقود مدى الحياة (زراعة)</h4>
                        <p className="text-xs text-slate-400 mt-1">غرسات تيتانيوم ألمانية فورية لاستعادة القوة والوظيفة الحيوية.</p>
                      </div>
                    </button>

                    <button
                      id="opt-goal-painless"
                      onClick={() => { setGoal('painless'); setStep(2); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        goal === 'painless' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-red-500/10 text-red-400 rounded-xl shrink-0"><Flame className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">علاج آلام الأسنان وحشو العصب الفوري</h4>
                        <p className="text-xs text-slate-400 mt-1">علاج قنوات العصب وإزالة الألم فوراً في جلسة واحدة بالروتاري.</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 2: Priority selection */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6 text-right"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block shrink-0" />
                    ما هو العامل الأكثر أهمية بالنسبة لك أثناء العلاج؟
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      id="opt-priority-painless"
                      onClick={() => { setPriority('painless'); setStep(3); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        priority === 'painless' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-teal-500/10 text-teal-400 rounded-xl shrink-0"><ShieldCheck className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">علاج بدون ألم بنسبة 100%</h4>
                        <p className="text-xs text-slate-400 mt-1">تخدير موضعي دقيق واستخدام ليزر تجميلي لمنع أي إزعاج.</p>
                      </div>
                    </button>

                    <button
                      id="opt-priority-aesthetic"
                      onClick={() => { setPriority('aesthetic'); setStep(3); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        priority === 'aesthetic' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-amber-500/10 text-amber-400 rounded-xl shrink-0"><Trophy className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">الجمالية والمظهر الطبيعي الدقيق</h4>
                        <p className="text-xs text-slate-400 mt-1">عدسات وتيجان مصممة رقمياً لتتلاءم بدقة مع ملامح وجهك وعينيك.</p>
                      </div>
                    </button>

                    <button
                      id="opt-priority-fast"
                      onClick={() => { setPriority('fast'); setStep(3); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        priority === 'fast' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-sky-500/10 text-sky-400 rounded-xl shrink-0"><Zap className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">إنجاز العلاج في أسرع وقت ممكن</h4>
                        <p className="text-xs text-slate-400 mt-1">تجهيز تيجان وتركيبات فورية واختصار الجلسات بفضل الأنظمة الرقمية.</p>
                      </div>
                    </button>

                    <button
                      id="opt-priority-installments"
                      onClick={() => { setPriority('installments'); setStep(3); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex items-start gap-4 cursor-pointer ${
                        priority === 'installments' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <span className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shrink-0"><CreditCard className="w-5 h-5" /></span>
                      <div>
                        <h4 className="font-bold text-white text-sm sm:text-base">تسهيلات مالية وتقسيط مريح</h4>
                        <p className="text-xs text-slate-400 mt-1">توفير خطط سداد مرنة للتخصصات الطويلة مثل التقويم والزراعة.</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: Doctor Preference */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 15 }}
                  className="space-y-6 text-right"
                >
                  <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400 block shrink-0" />
                    هل تفضل استشارة طبيب معين في عيادتنا؟
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                      id="opt-doc-amr"
                      onClick={() => { setPrefDoctor('dr-amr'); setStep(4); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 cursor-pointer ${
                        prefDoctor === 'dr-amr' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-lg border border-sky-500/30">
                        د. ع
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">د. عمرو العدوي</h4>
                        <p className="text-xs text-slate-400 mt-1">استشاري جراحة وزراعة الأسنان</p>
                        <span className="inline-block mt-2 text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-0.5 rounded-full font-bold">15+ سنة خبرة</span>
                      </div>
                    </button>

                    <button
                      id="opt-doc-basel"
                      onClick={() => { setPrefDoctor('dr-basel'); setStep(4); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex flex-col items-center text-center gap-3 cursor-pointer ${
                        prefDoctor === 'dr-basel' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg border border-blue-500/30">
                        د. ب
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">د. باسل المرسي</h4>
                        <p className="text-xs text-slate-400 mt-1">أخصائي تجميل وتقويم الأسنان</p>
                        <span className="inline-block mt-2 text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full font-bold">8+ سنوات خبرة</span>
                      </div>
                    </button>

                    <button
                      id="opt-doc-any"
                      onClick={() => { setPrefDoctor('any'); setStep(4); }}
                      className={`text-right p-5 rounded-2xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 cursor-pointer ${
                        prefDoctor === 'any' ? 'border-sky-500 bg-sky-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/40'
                      }`}
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center">
                        <Stethoscope className="w-7 h-7" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">لا يوجد تفضيل</h4>
                        <p className="text-xs text-slate-400 mt-1">الأخصائي الأكثر ملاءمة للحالة الموصى بها</p>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: Customized Recommendation Result */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="space-y-6 text-right"
                >
                  
                  {/* Recommended plan card layout */}
                  <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-inner">
                    <div className="absolute top-0 left-0 w-2 h-full bg-sky-500" />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-bold tracking-wider font-sans">خطة تجميلية علاجية مقترحة</span>
                        <h4 className="text-xl sm:text-2xl font-black text-white mt-2">
                          {recommendation.service.titleAr}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                          {recommendation.service.titleEn}
                        </p>
                      </div>
                      
                      <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-300">طبيبك المرشح: <strong>{recommendation.doctorName}</strong></span>
                      </div>
                    </div>

                    <p className="text-slate-300 text-sm leading-relaxed mt-5 p-4 bg-slate-950/40 border border-slate-800/40 rounded-2xl">
                      {recommendation.reasoning}
                    </p>

                    {/* Service details checkboxes */}
                    <div className="mt-6 space-y-3">
                      <h5 className="text-xs font-bold text-sky-400 uppercase tracking-wider">مميزات الرعاية والضمانات المشمولة في خطتك:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                        {recommendation.service.detailsAr.slice(0, 3).map((detail, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-3 h-3" />
                            </span>
                            <span>{detail}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-3 h-3" />
                          </span>
                          <span>أحدث أجهزة التخدير الرقمي بدون ألم</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      id="studio-book-recommended-btn"
                      onClick={() => onOpenBooking(recommendation.service.id)}
                      className="flex-1 p-4 bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm sm:text-base rounded-2xl transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 cursor-pointer transform hover:translate-y-[-1px]"
                    >
                      <Sparkles className="w-5 h-5 shrink-0" />
                      <span>احجز موعد استشارة لهذه الخطة</span>
                    </button>

                    <button
                      id="studio-restart-btn"
                      onClick={handleRestart}
                      className="p-4 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 font-bold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>إعادة الاختبار</span>
                    </button>
                  </div>

                </motion.div>
              )}

            </AnimatePresence>

            {/* Bottom Back Button and Navigation controls */}
            {step > 1 && step <= 3 && (
              <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-800/60" dir="rtl">
                <button
                  id="studio-back-btn"
                  onClick={() => setStep(step - 1)}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                
                <span className="text-[10px] text-slate-500">مستشار أزور الرقمي الآمن</span>
              </div>
            )}
          </div>

        </div>

        {/* Studio quick trust badges */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-white">100%</span>
            <p className="text-xs text-slate-500">دقة تشخيصية رقمية</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-white">0%</span>
            <p className="text-xs text-slate-500">ألم في حشو العصب والزراعة</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-white">2+ جلسة</span>
            <p className="text-xs text-slate-500">أقصى وقت لتجميل الأسنان</p>
          </div>
          <div className="space-y-1">
            <span className="text-xl font-bold font-mono text-white">10+ سنوات</span>
            <p className="text-xs text-slate-500">ضمان معتمد على الزيركون</p>
          </div>
        </div>

      </div>
    </section>
  );
}
