import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CalendarCheck, ScanFace, Stethoscope, Sparkles, ShieldCheck, 
  ChevronLeft, ArrowLeft, Clock, Heart, ClipboardList, Zap 
} from 'lucide-react';

interface JourneyStep {
  id: number;
  titleAr: string;
  titleEn: string;
  durationAr: string;
  icon: React.ReactNode;
  descriptionAr: string;
  detailsAr: string[];
  comfortHighlightAr: string;
}

export default function TreatmentJourney() {
  const [activeStep, setActiveStep] = useState(1);

  const steps: JourneyStep[] = [
    {
      id: 1,
      titleAr: 'الاستشارة والمسح الرقمي ثلاثي الأبعاد',
      titleEn: 'Digital 3D Scan & Consultation',
      durationAr: '30 - 45 دقيقة',
      icon: <ScanFace className="w-6 h-6" />,
      descriptionAr: 'تبدأ رحلتك بجلسة فحص ميكروسكوبي مريحة، نستخدم فيها الماسح الضوئي الرقمي ثلاثي الأبعاد (iTero) لتصوير تفاصيل الفك والأسنان بدقة متناهية دون الحاجة للمعجون التقليدي المزعج.',
      detailsAr: [
        'أخذ بصمة رقمية كاملة للأسنان في 3 دقائق فقط.',
        'فحص اللثة وعظام الفك بأحدث أجهزة الأشعة المخروطية ثلاثية الأبعاد (CBCT).',
        'مناقشة الأهداف الجمالية والطبية مع الطبيب الأخصائي مباشرة.'
      ],
      comfortHighlightAr: 'بدون أي استخدام للمعاجين التقليدية المسببة للغثيان.'
    },
    {
      id: 2,
      titleAr: 'تصميم ومحاكاة الابتسامة الموجهة رقمياً',
      titleEn: 'Digital Smile Design (DSD)',
      durationAr: 'جلسة واحدة مشتركة',
      icon: <Sparkles className="w-6 h-6" />,
      descriptionAr: 'نقوم بتحليل قياسات وجهك وعينيك عبر برنامج تصميم الابتسامة الرقمي (DSD)، لنعرض لك محاكاة حية وفورية لشكل ومظهر أسنانك الجديد قبل البدء في أي خطوة علاجية فعلياً.',
      detailsAr: [
        'رؤية ومناقشة النتيجة النهائية لأسنانك واختيار تفاصيل بياضها وعرضها.',
        'مواءمة شكل الأسنان الجديدة مع حركة الشفاه وملامح الوجه أثناء الضحك والحديث.',
        'تخصيص الخطة الطبية والجدول الزمني بما يتناسب مع ميزانيتك.'
      ],
      comfortHighlightAr: 'أنت شريك أساسي في تصميم ضحكتك وسرورها قبل البدء.'
    },
    {
      id: 3,
      titleAr: 'إجراء العلاج والتحضير فائق الدقة وبدون ألم',
      titleEn: 'Microscopic Treatment & Prep',
      durationAr: '1 - 2 جلسة فقط',
      icon: <Stethoscope className="w-6 h-6" />,
      descriptionAr: 'نطبق أدق معايير التحضير الميكروسكوبي لحفظ مينا السن الطبيعية، مع تفعيل تقنيات التخدير الرقمي الموضعي الذكي لضمان راحة تامة وخلو الجلسة من الآلام بنسبة 100%.',
      detailsAr: [
        'استخدام ميكروسكوبات الأسنان الألمانية للتحضير المجهري فائق الدقة (ميكرومترات فقط).',
        'تطبيق التخدير الموضعي الموجه بالكمبيوتر لمنع وخزة الإبر التقليدية.',
        'توفير بيئة هادئة ومريحة مع إمكانية مشاهدة شاشتك المفضلة أثناء الجلسة.'
      ],
      comfortHighlightAr: 'تخدير رقمي ذكي يمنع الشعور بوخزة الإبرة نهائياً.'
    },
    {
      id: 4,
      titleAr: 'تركيب وتثبيت الابتسامة واستلام الضمان المعتمد',
      titleEn: 'Final Placement & Lifetime Guarantee',
      durationAr: 'جلسة التثبيت النهائية',
      icon: <ShieldCheck className="w-6 h-6" />,
      descriptionAr: 'يتم تثبيت العدسات (Veneers) أو التيجان الفورية المصنوعة من الزيركون النقي باستخدام مواد لاصقة فائقة القوة والترابط الحيوي، لتخرج بابتسامة متينة، براقة، وطبيعية تماماً.',
      detailsAr: [
        'تثبيت مجهري دقيق ومقاوم للتصبغ والاصفرار مدى الحياة.',
        'تسليم المريض شهادة ضمان دولية معتمدة على خامات الزيركون والإيماكس المستخدمة.',
        'توفير طاقم متابعة وقائي دوري مجاني للاطمئنان على استقرار وصحة ابتسامتك.'
      ],
      comfortHighlightAr: 'استمتع بتناول مأكولاتك ومشروباتك المفضلة فوراً بثقة متناهية.'
    }
  ];

  const currentStep = steps.find(s => s.id === activeStep) || steps[0];

  return (
    <section 
      id="treatment-journey"
      className="py-24 bg-slate-50 relative overflow-hidden text-right"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-0 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-sans">
            <ClipboardList className="w-3.5 h-3.5" />
            <span>رحلتك معنا خطوة بخطوة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            مسار رحلتك العلاجية الرقمية المريحة
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نحن لا نعالج الأسنان فحسب، بل نصمم لك تجربة علاجية وصحية مريحة للغاية ومرحة خالية من القلق والرهبة من البداية وحتى تسليم الابتسامة.
          </p>
        </div>

        {/* Desktop / Mobile Timeline Steps Selector Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start" dir="rtl">
          
          {/* Step list navigation (col-span-12 lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-3">
            {steps.map((s) => {
              const isActive = s.id === activeStep;
              return (
                <button
                  id={`btn-journey-step-${s.id}`}
                  key={s.id}
                  onClick={() => setActiveStep(s.id)}
                  className={`w-full text-right p-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 group cursor-pointer focus:outline-none ${
                    isActive 
                      ? 'bg-white border-sky-500 shadow-md shadow-sky-100/50 translate-x-[-4px]' 
                      : 'bg-transparent border-slate-100 hover:border-slate-200 hover:bg-white/40'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-sky-500 text-white' : 'bg-slate-200/60 text-slate-500 group-hover:bg-slate-200'
                  }`}>
                    {s.icon}
                  </div>
                  <div className="flex-grow">
                    <span className={`text-[10px] font-bold font-mono tracking-wider block ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}>
                      STAGE 0{s.id}
                    </span>
                    <h4 className={`font-bold text-sm leading-tight transition-colors ${
                      isActive ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'
                    }`}>
                      {s.titleAr}
                    </h4>
                  </div>
                  <ChevronLeft className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-sky-500 translate-x-[-2px]' : 'text-slate-300 group-hover:text-slate-400'
                  }`} />
                </button>
              );
            })}
          </div>

          {/* Detailed Display Panel with staggered entry animation (col-span-12 lg:col-span-8) */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-slate-100 rounded-[32px] p-6 sm:p-10 shadow-lg relative overflow-hidden min-h-[380px] flex flex-col justify-between">
              
              {/* Subtle top background card brand */}
              <div className="absolute top-6 left-6 text-slate-100 select-none pointer-events-none font-mono font-black text-7xl leading-none">
                0{currentStep.id}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 relative z-10"
                >
                  {/* Step Category badge and title */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-sky-600 font-bold font-mono tracking-wider uppercase">
                      {currentStep.titleEn}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      {currentStep.titleAr}
                    </h3>
                  </div>

                  {/* Core description */}
                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {currentStep.descriptionAr}
                  </p>

                  {/* Bullet sub-features checklist */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ما يتم إنجازه في هذه المرحلة بالتحديد:</h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm text-slate-600 font-medium">
                      {currentStep.detailsAr.map((detail, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center font-mono text-[10px] shrink-0 font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-snug">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Safety Comfort Highlight Box */}
                  <div className="bg-emerald-50/50 border border-emerald-100/60 rounded-2xl p-4 flex items-center gap-3">
                    <span className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
                      <Zap className="w-4 h-4" />
                    </span>
                    <div className="text-xs font-medium text-emerald-800 leading-normal">
                      <strong className="block font-bold mb-0.5 text-emerald-950">معيار الراحة والرفاهية العالي:</strong>
                      {currentStep.comfortHighlightAr}
                    </div>
                  </div>

                </motion.div>
              </AnimatePresence>

              {/* Back & Next Navigation quick controls inside the card */}
              <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100 relative z-10">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-300" />
                  <span>الوقت المقدر:</span>
                  <strong className="text-slate-700">{currentStep.durationAr}</strong>
                </span>

                <div className="flex gap-2">
                  <button
                    id="btn-journey-nav-prev"
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none text-slate-600 rounded-xl border border-slate-200 transition-colors focus:outline-none"
                    title="المرحلة السابقة"
                  >
                    <ChevronLeft className="w-4 h-4 rotate-180" />
                  </button>

                  <button
                    id="btn-journey-nav-next"
                    disabled={activeStep === steps.length}
                    onClick={() => setActiveStep(prev => prev + 1)}
                    className="p-2.5 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 disabled:pointer-events-none text-white rounded-xl transition-all focus:outline-none flex items-center gap-1 text-xs font-bold"
                  >
                    <span>المرحلة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Global Journey conversion CTA banner */}
        <div className="mt-16 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-right space-y-1.5">
            <h4 className="font-bold text-base sm:text-lg">هل ترغب في الحصول على استشارة كشف رقمي مجانية؟</h4>
            <p className="text-xs text-slate-400">ابدأ رحلة تصميم ابتسامتك اليوم معنا مجاناً وبدون أي التزامات مالية مسبقة.</p>
          </div>
          
          <button
            id="journey-book-cta"
            onClick={() => {
              const el = document.getElementById('navbar-booking-btn');
              if (el) el.click();
            }}
            className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-sky-500/10 shrink-0 cursor-pointer"
          >
            حجز استشارة رقمية فورية
          </button>
        </div>

      </div>
    </section>
  );
}
