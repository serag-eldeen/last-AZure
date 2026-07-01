import React from 'react';
import { ShieldCheck, HeartHandshake, Zap, Award, Sparkles } from 'lucide-react';

export default function TrustBar() {
  const items = [
    { label: 'أحدث التجهيزات الألمانية الرقمية', sub: '3D Planning', icon: Sparkles },
    { label: 'تعقيم كامل وموثق Class-B', sub: 'Autoclave Safe', icon: ShieldCheck },
    { label: 'إدارة ألم متقدمة وجلسات مريحة', sub: 'Comfort First', icon: HeartHandshake },
    { label: 'كفاءات استشارية معتمدة علمياً', sub: 'Elite Surgeons', icon: Award },
  ];

  return (
    <div className="relative z-20 -mt-8 max-w-6xl mx-auto px-4" dir="rtl">
      <div className="bg-white/70 backdrop-blur-md border border-slate-200/60 shadow-xl rounded-[24px] p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
        {items.map((item, idx) => {
          const IconComp = item.icon;
          return (
            <div 
              id={`trust-bar-item-${idx}`}
              key={idx}
              className="flex items-center gap-4 group transition-all"
            >
              <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-sky-500 group-hover:bg-sky-500 group-hover:text-white transition-all duration-300 transform group-hover:scale-105 shrink-0">
                <IconComp className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors duration-200">{item.label}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono font-medium tracking-wider uppercase">{item.sub}</p>
              </div>
              {idx < items.length - 1 && (
                <div className="hidden lg:block h-8 w-[1px] bg-slate-200 mr-auto self-center" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
