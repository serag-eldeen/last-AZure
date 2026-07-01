import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquareQuote, Star, ChevronLeft, ChevronRight, User, ShieldCheck } from 'lucide-react';
import { TESTIMONIALS } from '../data';

export default function Testimonials() {
  const [activeIdx, setActiveIdx] = useState(0);

  const handleNext = () => {
    setActiveIdx((activeIdx + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setActiveIdx((activeIdx - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const current = TESTIMONIALS[activeIdx];

  return (
    <section 
      id="testimonials"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Decorative blurs */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-sans">
            <MessageSquareQuote className="w-3.5 h-3.5" />
            <span>قصص نجاح حقيقية</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ماذا يقول مرضانا عن عيادة Azure؟
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نسعد ونفخر بكل الابتسامات التي ساهمنا في تجميلها ورعايتها. رضا مرضانا وبناء علاقات ثقة طويلة الأمد هو هدفنا الأساسي.
          </p>
        </div>

        {/* Interactive Testimonial Frame with sliding animation */}
        <div className="relative min-h-[300px] flex flex-col items-center justify-center text-right" dir="rtl">
          
          <div className="w-full bg-slate-50 border border-slate-100 p-6 sm:p-10 rounded-[32px] shadow-sm relative overflow-hidden">
            
            {/* Huge elegant quote mark in the background */}
            <div className="absolute top-4 left-6 text-slate-200/40 select-none pointer-events-none font-sans font-black text-8xl leading-none">
              ”
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Star rating row */}
                <div className="flex gap-1 items-center justify-start text-amber-500">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-500 shrink-0" />
                  ))}
                  <span className="text-[10px] text-slate-400 font-bold font-mono mr-2 leading-none">VERIFIED REVIEW</span>
                </div>

                {/* Main Quote text */}
                <p className="text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
                  {current.quote}
                </p>

                {/* Patient Profile Row */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-200/50">
                  <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-500 border border-sky-100">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{current.name}</h4>
                    <p className="text-xs text-sky-600 mt-0.5 font-medium">علاج: {current.treatment}</p>
                  </div>
                  <span className="mr-auto text-[11px] text-slate-400 font-mono font-medium">{current.date}</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Controls underneath */}
          <div className="flex items-center gap-4 mt-8">
            <button
              id="testimonial-prev-btn"
              onClick={handlePrev}
              className="p-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full shadow-sm hover:shadow transition-all focus:outline-none"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-1.5 items-center">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  id={`btn-testimonial-dot-${idx}`}
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`h-2 rounded-full transition-all ${
                    activeIdx === idx ? 'w-6 bg-sky-500' : 'w-2 bg-slate-200'
                  }`}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>

            <button
              id="testimonial-next-btn"
              onClick={handleNext}
              className="p-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-full shadow-sm hover:shadow transition-all focus:outline-none"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* local Trust summary widget */}
        <div className="mt-16 text-center space-y-2">
          <div className="flex justify-center items-center gap-1 text-xs text-slate-400 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>بناءً على أكثر من 200+ تقييم حقيقي على خرائط جوجل وفيسبوك</span>
          </div>
        </div>

      </div>
    </section>
  );
}
