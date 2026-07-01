import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, ChevronDown, Check, Sparkles } from 'lucide-react';
import { FAQS } from '../data';

export default function FAQSection() {
  const [openId, setOpenId] = useState<string | null>('f1'); // Default open first

  const toggleAccordion = (id: string) => {
    setOpenId(prev => (prev === id ? null : id));
  };

  return (
    <section 
      id="faq"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-1/4 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-xs font-bold font-sans">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>الإجابة على تساؤلاتكم</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            الأسئلة الشائعة حول علاج وتجميل الأسنان
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نهتم بتوضيح كافة الجوانب ليكون مريضنا على بيّنة تامة بكافة الخيارات الطبية والخطوات الوقائية المتبعة في عيادتنا.
          </p>
        </div>

        {/* Accordions List */}
        <div className="space-y-4" dir="rtl">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                id={`faq-item-${faq.id}`}
                key={faq.id}
                className={`bg-white border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-sky-500/40 shadow-md shadow-sky-100/50' : 'border-slate-100/80 hover:border-slate-200'
                }`}
              >
                {/* Trigger Button */}
                <button
                  id={`btn-toggle-faq-${faq.id}`}
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-right focus:outline-none"
                >
                  <div className="flex items-center gap-3.5 pl-4">
                    <span className={`p-2 rounded-xl transition-colors shrink-0 ${
                      isOpen ? 'bg-sky-500 text-white' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <HelpCircle className="w-4 h-4" />
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-sky-500' : ''}`} />
                </button>

                {/* Content Panel */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-5 pb-5 pt-1 pr-[60px] text-xs sm:text-sm text-slate-600 leading-relaxed font-sans">
                        <p className="border-t border-slate-50 pt-3">
                          {faq.answer}
                        </p>
                        
                        {/* Bullet footer recommendation in FAQ to raise conversion */}
                        <div className="flex items-center gap-1.5 text-[11px] text-sky-600 font-bold mt-4">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>هل لديك استفسار إضافي؟ اضغط على زر الواتساب بالأسفل لمحادثة فورية مع طبيب مختص.</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
