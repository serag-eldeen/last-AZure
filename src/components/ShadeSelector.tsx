import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Eye, Info, Check, ShieldAlert, Heart, Calendar } from 'lucide-react';

interface ShadeGuide {
  code: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  descriptionAr: string;
  skinMatchAr: string;
  popularityAr: string;
  recommendationAr: string;
}

export default function ShadeSelector() {
  const [selectedShadeCode, setSelectedShadeCode] = useState<string>('B1');

  const shades: ShadeGuide[] = [
    {
      code: 'BL1',
      nameAr: 'بياض هوليوود فائق النقاء',
      nameEn: 'Hollywood Bleach White',
      hex: '#FFFFFD',
      descriptionAr: 'درجة البياض الأكثر سطوعاً ونقاءً على الإطلاق. تمنح ابتسامة باهرة جداً ومثيرة للانتباه تحت الإضاءة المختلفة.',
      skinMatchAr: 'تناسب تماماً أصحاب البشرة السمراء والبرونزية العميقة لإحداث تباين جمالي باهر وساحر.',
      popularityAr: 'مطلوبة بشدة من قِبل الفنانين، مشاهير السوشيال ميديا، ومحبي المظهر البارز جداً.',
      recommendationAr: 'ننصح باختيارها في عدسات الإيماكس (E-Max Veneers) لضمان بريق متألق ودائم لا يخفت.'
    },
    {
      code: 'BL2',
      nameAr: 'البياض الناصع الطبيعي',
      nameEn: 'Natural Bleach White',
      hex: '#FFFDF6',
      descriptionAr: 'درجة بياض مبيضة ممتازة لكنها تتميز بنعومة أكثر هدوءاً من BL1. تمنح مظهراً فائق الجمال دون المظهر الاصطناعي الصارخ.',
      skinMatchAr: 'تلائم أغلب درجات البشرة الحنطية والقمحية الفاتحة في الشرق الأوسط.',
      popularityAr: 'الدرجة الأكثر مبيعاً لعدسات الفينير واللومينير هذا العام بين الشباب والشابات.',
      recommendationAr: 'خيار تجميلي ممتاز يجمع بين إشراقة هوليوود والنعومة الطبيعية الجذابة.'
    },
    {
      code: 'A1',
      nameAr: 'بياض الأسنان الطبيعي الفاتح',
      nameEn: 'Premium Light Natural',
      hex: '#FFFCEE',
      descriptionAr: 'أفتح درجة في ظلال الأسنان الطبيعية غير المبيضة. تبدو وكأنها أسنان طبيعية فائقة العناية والجمال والنظافة.',
      skinMatchAr: 'تتناسب مع البشرة البيضاء والقمحية الفاتحة، وتبدو طبيعية تماماً لمن لا يريد أن يعرف أحد أنه أجرى تجميلاً.',
      popularityAr: 'مفضلة جداً لرجال الأعمال، الأطباء، والمهنيين الذين يبحثون عن مظهر وقور وطبيعي 100%.',
      recommendationAr: 'درجة تجميلية مثالية للحشوات التجميلية الأمامية وتيجان الزيركون الخلفية المتناسقة.'
    },
    {
      code: 'B1',
      nameAr: 'الظلال الطبيعية الدافئة الشابة',
      nameEn: 'Warm Natural Youthful',
      hex: '#FFF9E3',
      descriptionAr: 'درجة دافئة مبهجة تعكس الحيوية والصحة الطبيعية. تمتاز بشفافية خفيفة عند الأطراف تحاكي تشريح السن البشري الطبيعي.',
      skinMatchAr: 'تناسب جميع ألوان البشرة وتوفر إطلالة صحية ودافئة غاية في النعومة والصدق.',
      popularityAr: 'الاختيار القياسي العالمي لعمليات تبييض الأسنان بالليزر وتجميل الابتسامة المحافظ.',
      recommendationAr: 'نوصي بها بشدة لمرضى التبييض المنزلي أو الليزر في العيادة للوصول لمظهر صحي طبيعي.'
    }
  ];

  const currentShade = shades.find(s => s.code === selectedShadeCode) || shades[3];

  return (
    <section 
      id="shade-selector"
      className="py-24 bg-slate-950 text-white relative overflow-hidden text-right"
    >
      {/* Radiant atmospheric background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>مستشار درجات البياض الرقمي</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            اختر درجة البياض المثالية لملامح وجهك
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            البياض الجميل ليس عشوائياً. استعرض درجات أدلة الألوان الطبية المعتمدة عالمياً لعدسات الأسنان التجميلية، واكتشف الدرجة الأكثر ملاءمة للون بشرتك ومظهرك الشخصي.
          </p>
        </div>

        {/* Interactive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch" dir="rtl">
          
          {/* Column 1: Interactive Tooth Preview & Shade Selector Slider (col-span-12 lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900/60 border border-slate-800 rounded-[32px] p-6 sm:p-8 relative overflow-hidden">
            
            <div className="space-y-6">
              <h3 className="font-bold text-base text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                معاينة سن تجميلي تفاعلي:
              </h3>

              {/* Dynamic Tooth graphic container */}
              <div className="py-12 flex justify-center items-center bg-slate-950/80 rounded-2xl border border-slate-800/80 relative overflow-hidden shadow-inner">
                
                {/* Tooth Shape rendered via CSS with custom inline color filter */}
                <div className="relative w-28 h-36 flex flex-col items-center">
                  
                  {/* Subtle shadow glow matching the shade brightness */}
                  <div 
                    className="absolute inset-0 rounded-b-[40px] rounded-t-[20px] filter blur-xl opacity-30 transition-all duration-500" 
                    style={{ backgroundColor: currentShade.hex }}
                  />

                  {/* Aesthetic styled Tooth Shape overlay */}
                  <div 
                    className="w-24 h-32 rounded-t-[30px] rounded-b-[45px] transition-all duration-500 shadow-lg border border-white/10 relative overflow-hidden"
                    style={{ 
                      backgroundColor: currentShade.hex,
                      boxShadow: 'inset 0 -15px 30px rgba(0,0,0,0.08), inset 0 10px 20px rgba(255,255,255,0.6)' 
                    }}
                  >
                    {/* Natural enamel reflection overlay lines */}
                    <div className="absolute top-2 left-3 w-1.5 h-16 bg-white/40 rounded-full filter blur-[1px]" />
                    <div className="absolute top-2 left-6 w-1 h-20 bg-white/20 rounded-full filter blur-[1px]" />
                    <div className="absolute bottom-1 right-3 w-12 h-4 bg-white/20 rounded-full rotate-12 filter blur-[1px]" />
                  </div>

                  {/* Dental Shade Guide Stamp Badge */}
                  <div className="absolute bottom-[-10px] bg-slate-900 border border-slate-800 text-sky-400 font-mono font-black text-xs px-3 py-1 rounded-full shadow-md">
                    SHADE: {currentShade.code}
                  </div>
                </div>

              </div>

              {/* Slider selector dots */}
              <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 block">اختر دليل درجة اللون الطبية:</label>
                <div className="grid grid-cols-4 gap-2">
                  {shades.map((s) => (
                    <button
                      id={`btn-shade-select-${s.code}`}
                      key={s.code}
                      onClick={() => setSelectedShadeCode(s.code)}
                      className={`py-3.5 rounded-xl border font-mono font-black text-xs sm:text-sm transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                        s.code === selectedShadeCode 
                          ? 'border-sky-500 bg-sky-500/10 text-white' 
                          : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <span>{s.code}</span>
                      <div 
                        className="w-5 h-2.5 rounded border border-black/10 shadow-sm" 
                        style={{ backgroundColor: s.hex }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Warning/Instruction footnote */}
            <div className="mt-6 flex gap-2 text-[10px] text-slate-500 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p>
                * إن اختيار لون الابتسامة يعتمد على عمر المريض، جنسه، ولون بشرته الطبيعي. الطبيب الأخصائي يقدم لك النصح التام لتفادي المظهر المصطنع والوصول لابتسامة طبيعية باهرة.
              </p>
            </div>

          </div>

          {/* Column 2: Selected Shade Details & Recommendations (col-span-12 lg:col-span-7) */}
          <div className="lg:col-span-7 flex flex-col justify-between bg-slate-900/40 border border-slate-800/60 rounded-[32px] p-6 sm:p-10 shadow-2xl relative overflow-hidden">
            
            <div className="space-y-6">
              
              {/* Shade Title */}
              <div className="pb-4 border-b border-slate-800/60">
                <span className="text-[10px] bg-sky-500/10 text-sky-400 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider font-sans">
                  الدليل اللوني الطبي: {currentShade.code}
                </span>
                <h4 className="text-xl sm:text-2xl font-black text-white mt-2.5">
                  {currentShade.nameAr}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5 uppercase tracking-wide">
                  {currentShade.nameEn}
                </p>
              </div>

              {/* Core Description block */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-500">الوصف الطبي والتأثير البصري:</span>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {currentShade.descriptionAr}
                </p>
              </div>

              {/* Metadata rows */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                
                {/* Skin tone matching */}
                <div className="p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl space-y-1.5">
                  <span className="text-xs font-bold text-sky-400 flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5" />
                    ملاءمة لون البشرة:
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentShade.skinMatchAr}
                  </p>
                </div>

                {/* Popularity metric */}
                <div className="p-4 bg-slate-950/50 border border-slate-800/50 rounded-2xl space-y-1.5">
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    الفئات الأكثر طلباً للدرجة:
                  </span>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {currentShade.popularityAr}
                  </p>
                </div>

              </div>

              {/* Medical suggestion quote block */}
              <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl flex gap-3">
                <span className="w-6 h-6 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0 text-xs font-bold font-sans">i</span>
                <div className="text-xs sm:text-sm text-sky-300 leading-relaxed">
                  <strong className="block font-bold mb-0.5 text-white">توصية أخصائي التجميل لدينا:</strong>
                  {currentShade.recommendationAr}
                </div>
              </div>

            </div>

            {/* Direct Booking CTA */}
            <div className="pt-8 border-t border-slate-800/60 mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="text-right">
                <h5 className="font-bold text-sm text-white">هل استقررت على هذه الدرجة لأسنانك؟</h5>
                <p className="text-xs text-slate-500">احجز موعد استشارة تصميم الابتسامة الرقمي لمناقشة الخطة مع الطبيب.</p>
              </div>

              <button
                id="shade-book-cta-btn"
                onClick={() => {
                  const el = document.getElementById('navbar-booking-btn');
                  if (el) el.click();
                }}
                className="w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-lg shadow-sky-500/10 cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>احجز موعد معاينة وتصميم</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
