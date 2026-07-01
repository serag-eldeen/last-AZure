import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Smile, ShieldAlert, Award, Activity, HeartHandshake, 
  ChevronDown, Clock, Info, Check, CalendarRange 
} from 'lucide-react';
import { SERVICES } from '../data';

interface ServicesSectionProps {
  onOpenBooking: (serviceId?: string) => void;
}

export default function ServicesSection({ onOpenBooking }: ServicesSectionProps) {
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);

  const toggleDetails = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedServiceId(prev => (prev === id ? null : id));
  };

  // Helper to map icon names to Lucide icons
  const getIcon = (name: string, isBig: boolean) => {
    const sizeClass = isBig ? "w-6 h-6 text-sky-500" : "w-5 h-5 text-sky-500";
    switch (name) {
      case 'Sparkles': return <Sparkles className={sizeClass} />;
      case 'Smile': return <Smile className={sizeClass} />;
      case 'ShieldAlert': return <ShieldAlert className={sizeClass} />;
      case 'Award': return <Award className={sizeClass} />;
      case 'Activity': return <Activity className={sizeClass} />;
      case 'HeartHandshake': return <HeartHandshake className={sizeClass} />;
      default: return <Info className={sizeClass} />;
    }
  };

  return (
    <section 
      id="services"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      {/* Decorative floating dots */}
      <div className="absolute top-0 right-10 w-44 h-44 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-xs font-bold font-sans">
            <Smile className="w-3.5 h-3.5" />
            <span>خدمات علاجية وتجميلية متكاملة</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            نخبة الخدمات العلاجية بأحدث التقنيات
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نتبنى في عيادة أزور لطب الأسنان فلسفة العلاج الدقيق والمريح. نستخدم أفضل الخامات الطبية المعتمدة عالمياً لضمان ابتسامة صحية تدوم مدى الحياة.
          </p>
        </div>

        {/* BENTO GRID COMPOSITION */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6" dir="rtl">
          {SERVICES.map((s) => {
            // Implants & Hollywood smile are high-value featured big cards
            const isFeatured = s.id === 'dental-implants' || s.id === 'hollywood-smile';
            const isExpanded = expandedServiceId === s.id;

            return (
              <div
                id={`service-card-${s.id}`}
                key={s.id}
                onClick={() => onOpenBooking(s.id)}
                className={`group text-right bg-white border border-slate-100/80 rounded-[28px] p-6 sm:p-8 hover:shadow-xl hover:border-slate-200 transition-all duration-300 relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isFeatured 
                    ? 'md:col-span-12 lg:col-span-6 shadow-md shadow-slate-100/40' 
                    : 'md:col-span-6 lg:col-span-4'
                }`}
              >
                {/* Background decorative vector */}
                <div className="absolute top-[-10%] left-[-10%] w-32 h-32 bg-sky-100/10 rounded-full blur-2xl group-hover:bg-sky-500/5 transition-colors duration-500" />
                
                {/* Header Block */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="p-3 bg-sky-50 text-sky-500 rounded-2xl group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 transform group-hover:rotate-6 shrink-0">
                      {getIcon(s.iconName, isFeatured)}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-sky-500" />
                      {s.duration}
                    </span>
                  </div>

                  <div className="mt-5 space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors">
                      {s.titleAr}
                    </h3>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                      {s.titleEn}
                    </p>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed pt-2">
                      {s.descAr}
                    </p>
                  </div>
                </div>

                {/* Interactive expandable details block */}
                <div className="mt-6 border-t border-slate-100 pt-4">
                  <button
                    id={`btn-toggle-service-details-${s.id}`}
                    type="button"
                    onClick={(e) => toggleDetails(s.id, e)}
                    className="w-full flex items-center justify-between text-xs text-sky-600 hover:text-sky-700 font-bold py-1 focus:outline-none"
                  >
                    <span className="flex items-center gap-1">
                      <Info className="w-4 h-4" />
                      {isExpanded ? 'إخفاء التفاصيل العلاجية' : 'عرض مميزات التقنية والمواد'}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3"
                      >
                        <div className="bg-slate-50 rounded-2xl p-4 space-y-2.5 border border-slate-100">
                          {s.detailsAr.map((detail, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-slate-600 leading-relaxed">
                              <span className="w-4 h-4 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-2.5 h-2.5" />
                              </span>
                              <span>{detail}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA Action overlay visual */}
                <div className="mt-5 flex items-center justify-between text-xs font-bold text-slate-700 group-hover:text-sky-600 pt-2 transition-colors">
                  <span className="flex items-center gap-1 font-sans">
                    <CalendarRange className="w-4 h-4 text-sky-500" />
                    اضغط لحجز الموعد مباشرة
                  </span>
                  <span className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-500 transition-all transform group-hover:translate-x-[-4px]">
                    ←
                  </span>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
