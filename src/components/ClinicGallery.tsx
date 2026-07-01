import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, X, ChevronLeft, ChevronRight, Eye, ShieldCheck } from 'lucide-react';

export default function ClinicGallery() {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number | null>(null);

  const photos = [
    {
      url: '/src/assets/images/advanced_dental_tech_1782702881731.jpg',
      title: 'غرفة الاستشارة والمسح الرقمي',
      desc: 'حيث نقوم بتخطيط وعرض الابتسامة الموجهة رقمياً للمريض قبل البدء بالعمل'
    },
    {
      url: '/src/assets/images/clinic_waiting_lounge_1782801892314.jpg',
      title: 'صالة الاستقبال والانتظار الراقية',
      desc: 'بيئة مهدئة للأعصاب مجهزة بالكامل لضمان راحة ورفاهية المرضى والمرافقين'
    },
    {
      url: '/src/assets/images/hero_clinic_interior_1782702865845.jpg',
      title: 'جهاز الأسنان الألماني المتكامل',
      desc: 'كرسي علاجي مجهز بأنظمة مجهرية وشفاط هيدروليكي فائق الهدوء لمنع التوتر'
    },
    {
      url: '/src/assets/images/sterilization_equipment_1782801859693.jpg',
      title: 'وحدة التعبئة والتعقيم الحراري Class-B',
      desc: 'بروتوكولات حظر عدوى صارمة تُطبّق في غرفة مستقلة معزولة لضمان أمان المرضى'
    }
  ];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx + 1) % photos.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (activePhotoIdx !== null) {
      setActivePhotoIdx((activePhotoIdx - 1 + photos.length) % photos.length);
    }
  };

  return (
    <section 
      id="gallery"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-xs font-bold font-sans">
            <Camera className="w-3.5 h-3.5" />
            <span>معرض العيادة الحقيقي</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            جولة داخل أروقة عيادة Azure
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            تفخر عيادتنا بتقديم أرقى مستويات الفخامة والنظافة الطبية. تعرّف على بيئتنا المجهّزة بأحدث الأجهزة لتشعر بالراحة والسكينة من الخطوة الأولى.
          </p>
        </div>

        {/* Masonry-style Responsive Photo Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" dir="rtl">
          {photos.map((p, idx) => (
            <div
              id={`gallery-thumb-${idx}`}
              key={idx}
              onClick={() => setActivePhotoIdx(idx)}
              className="group bg-white rounded-3xl p-3 border border-slate-100 shadow-sm hover:shadow-md cursor-pointer transition-all relative overflow-hidden"
            >
              <div className="relative rounded-2xl overflow-hidden aspect-square bg-slate-100">
                <img 
                  src={p.url} 
                  alt={p.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                
                {/* Hover magnifying overlay */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white border border-white/20 shadow-md transform scale-90 group-hover:scale-100 transition-transform duration-300">
                    <Eye className="w-5 h-5" />
                  </span>
                </div>
              </div>

              {/* Caption */}
              <div className="mt-3.5 px-1 text-right">
                <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Live stats underneath */}
        <div className="mt-16 bg-white/60 border border-slate-200/60 rounded-[24px] p-6 max-w-4xl mx-auto flex flex-col md:flex-row justify-around gap-6 text-center items-center" dir="rtl">
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-sky-500 font-mono leading-none block">100%</span>
            <span className="text-xs font-bold text-slate-700 block mt-1">مطابقة لمعايير وزارة الصحة المصرية</span>
          </div>
          <div className="hidden md:block h-6 w-[1px] bg-slate-200" />
          <div className="space-y-1">
            <span className="text-2xl font-extrabold text-sky-500 font-mono leading-none block">Class-B</span>
            <span className="text-xs font-bold text-slate-700 block mt-1">أجهزة تعقيم بخارية فائقة الضغط</span>
          </div>
          <div className="hidden md:block h-6 w-[1px] bg-slate-200" />
          <div className="space-y-1 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-500 shrink-0" />
            <div className="text-right">
              <span className="text-xs font-extrabold text-slate-900 block leading-none">مستشفى ميت غمر</span>
              <span className="text-[10px] text-slate-400 block mt-0.5">معايير طبية وعقود تفتيش رسمية</span>
            </div>
          </div>
        </div>

        {/* LIGHTBOX MODAL */}
        <AnimatePresence>
          {activePhotoIdx !== null && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActivePhotoIdx(null)}
                className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
              />

              {/* Close Button */}
              <button
                id="close-lightbox-btn"
                onClick={() => setActivePhotoIdx(null)}
                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full z-10 hover:bg-white/20 transition-all focus:outline-none"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Content Frame */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative max-w-4xl w-full z-10 overflow-hidden flex flex-col items-center"
              >
                {/* Image panel */}
                <div className="relative aspect-[3/2] w-full max-h-[70vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                  <img 
                    src={photos[activePhotoIdx].url} 
                    alt={photos[activePhotoIdx].title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {/* Nav Controls */}
                  <button
                    id="lightbox-prev-btn"
                    onClick={handlePrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 border border-white/10 text-white hover:bg-slate-950 transition-all focus:outline-none"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    id="lightbox-next-btn"
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/60 border border-white/10 text-white hover:bg-slate-950 transition-all focus:outline-none"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Info panel */}
                <div className="w-full max-w-2xl text-center text-white mt-4 space-y-1 px-4" dir="rtl">
                  <h4 className="text-lg font-bold text-white">{photos[activePhotoIdx].title}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{photos[activePhotoIdx].desc}</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
