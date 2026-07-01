import React from 'react';
import { Award, Check, Calendar, HeartHandshake, ShieldCheck } from 'lucide-react';
import { DOCTORS } from '../data';

interface DoctorsSectionProps {
  onOpenBooking: () => void;
  doctorPortraitImage: string; // From generated images
}

export default function DoctorsSection({ onOpenBooking, doctorPortraitImage }: DoctorsSectionProps) {
  return (
    <section 
      id="doctors"
      className="py-24 bg-white relative overflow-hidden"
    >
      <div className="absolute top-1/4 left-10 w-72 h-72 bg-sky-200/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-blue-100/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-sans">
            <Award className="w-3.5 h-3.5" />
            <span>نخبة من كبار أطبائنا الاستشاريين</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            أطباء متميزون تضع ثقتك بهم
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نضم في عيادة أزور نخبة من الأخصائيين والاستشاريين العاملين بمستشفى ميت غمر العام وأعضاء الجمعيات التجميلية المصرية لضمان تشخيص علمي دقيق وعلاجات معتمدة.
          </p>
        </div>

        {/* Doctors Grid list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12" dir="rtl">
          {DOCTORS.map((d) => {
            // If ID matches amr, use our premium generated image
            const isAmr = d.id === 'dr-amr';
            const imgPath = isAmr ? doctorPortraitImage : d.image;

            return (
              <div 
                id={`doctor-card-${d.id}`}
                key={d.id}
                className="bg-slate-50 rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-md flex flex-col md:flex-row gap-6 items-start transition-all duration-300 hover:shadow-lg hover:border-slate-200"
              >
                {/* Doctor Visual Image Container */}
                <div className="relative w-full md:w-48 shrink-0 aspect-[3/4] md:aspect-auto md:h-64 rounded-2xl overflow-hidden bg-slate-200 border border-white shadow-inner">
                  <img 
                    src={imgPath} 
                    alt={d.nameAr} 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {/* Absolute subtle tag on image */}
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white text-[9px] font-bold px-2.5 py-1 rounded-full border border-slate-800">
                    {d.experience}
                  </div>
                </div>

                {/* Doctor Bio & Credentials content */}
                <div className="flex-1 text-right space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{d.nameAr}</h3>
                    <p className="text-xs uppercase font-bold text-slate-400 font-mono tracking-wider mt-0.5">{d.nameEn}</p>
                    <p className="text-xs font-semibold text-sky-600 mt-1.5">{d.roleAr}</p>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    {d.bioAr}
                  </p>

                  {/* Certificates / Qualifications */}
                  <div className="space-y-1.5 border-t border-slate-200/60 pt-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">الاعتمادات والشهادات:</h4>
                    <div className="grid grid-cols-1 gap-1.5 pt-1.5">
                      {d.certificates.map((cert, cIdx) => (
                        <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-700 font-medium">
                          <span className="w-4 h-4 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                          <span className="leading-snug">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick trigger */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      id={`btn-doctor-schedule-${d.id}`}
                      onClick={onOpenBooking}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>حجز موعد استشارة مع الطبيب</span>
                    </button>
                    
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span>حجز معتمد</span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
