import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, Check, Smile, Sparkles, UserCheck } from 'lucide-react';

export default function BeforeAfter() {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage (0-100)
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDraggingRef.current) return;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;
    handleMove(e.clientX);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleMouseUp);
  };

  // Pre-configured cases to explore
  const cases = [
    { title: 'تصميم ابتسامة كاملة لعدسات الزيركون والفينير الرقمية (جلسة واحدة)', beforeLabel: 'قبل عدسات الفينير', afterLabel: 'بعد عدسات الفينير' },
    { title: 'تقويم أسنان غير مرئي (Invisible Aligners) لمعالجة تراكب الفك المزدوج', beforeLabel: 'قبل التقويم', afterLabel: 'بعد التقويم' }
  ];

  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

  // Before & After image sources matching the selected cosmetic case index
  const beforeImages = [
    '/src/assets/images/before_smile_veneers_1782801906980.jpg', // Veneers before
    '/src/assets/images/before_smile_aligners_1782801941154.jpg'  // Aligners before
  ];

  const afterImages = [
    '/src/assets/images/after_smile_veneers_1782801921211.jpg', // Veneers after
    '/src/assets/images/after_smile_aligners_1782801954166.jpg'  // Aligners after
  ];

  return (
    <section 
      id="cases"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Background gradients */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-sans">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>نتائج حية لمرضانا</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            شاهد التحول الإيجابي قبل وبعد العلاج
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نسعى جاهدين لتحقيق أفضل مظهر جمالي وأعلى درجات الوظيفية الحيوية لأسنانك. اسحب مقبض التمرير لمشاهدة الفارق المذهل بأنفسكم.
          </p>
        </div>

        {/* Case Selection Tabs */}
        <div className="flex flex-col sm:flex-row gap-2.5 justify-center mb-10" dir="rtl">
          {cases.map((c, idx) => {
            const isActive = activeCaseIdx === idx;
            return (
              <button
                id={`btn-case-tab-${idx}`}
                key={idx}
                type="button"
                onClick={() => {
                  setActiveCaseIdx(idx);
                  setSliderPosition(50); // Reset position
                }}
                className={`px-5 py-3 rounded-2xl text-xs font-bold border transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white border-slate-950 shadow-md' 
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {c.title.split(' (')[0]}
              </button>
            );
          })}
        </div>

        {/* Main Interactive Comparison Slider Frame */}
        <div className="space-y-6" dir="rtl">
          <div className="bg-slate-50 border border-slate-100 p-3 sm:p-5 rounded-[32px] shadow-lg">
            <div 
              ref={containerRef}
              className="relative aspect-[3/2] w-full rounded-[24px] overflow-hidden select-none cursor-ew-resize border border-white"
              onMouseDown={handleMouseDown}
              onTouchStart={handleTouchStart}
            >
              {/* After Image (Base) */}
              <img 
                src={afterImages[activeCaseIdx]} 
                alt="After cosmetic dental treatment" 
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute bottom-4 right-4 bg-emerald-500/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full z-20 flex items-center gap-1 backdrop-blur-sm">
                <Check className="w-3.5 h-3.5" />
                <span>{cases[activeCaseIdx].afterLabel}</span>
              </div>

              {/* Before Image (Overlay Width-controlled) */}
              <div 
                className="absolute inset-y-0 left-0 overflow-hidden pointer-events-none"
                style={{ width: `${sliderPosition}%` }}
              >
                <img 
                  src={beforeImages[activeCaseIdx]} 
                  alt="Before cosmetic dental treatment" 
                  className="absolute inset-0 w-full h-full object-cover max-w-none"
                  style={{ width: containerRef.current ? containerRef.current.offsetWidth : '100%', height: '100%' }}
                  referrerPolicy="no-referrer"
                />
                
                <div className="absolute bottom-4 left-4 bg-red-600/90 text-white text-[10px] sm:text-xs font-bold px-3 py-1.5 rounded-full z-20 backdrop-blur-sm">
                  <span>{cases[activeCaseIdx].beforeLabel}</span>
                </div>
              </div>

              {/* Divider Line */}
              <div 
                className="absolute inset-y-0 w-1 bg-white shadow-lg pointer-events-none z-10"
                style={{ left: `${sliderPosition}%` }}
              >
                {/* Drag Handle Knob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-white text-sky-600 rounded-full shadow-2xl flex items-center justify-center border-2 border-sky-100/20 cursor-ew-resize hover:scale-105 active:scale-95 transition-transform">
                  <ArrowLeftRight className="w-4 h-4 sm:w-5 h-5" />
                </div>
              </div>

            </div>
          </div>

          {/* Description of current Case */}
          <div className="p-5 bg-sky-50/50 border border-sky-100/40 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-800 font-mono uppercase tracking-wide">الحالة المعروضة حالياً</h4>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {cases[activeCaseIdx].title} — نضمن تصميم ابتسامة رقمي فائق التطابق مع ملامح الوجه الطبيعية وعظام الفك مع استعادة ناصعة البياض تدوم طويلاً بفضل عدسات الزيركون المدعومة ومواد التعقيم الصارمة.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
