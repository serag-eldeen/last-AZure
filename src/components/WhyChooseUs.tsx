import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, UserCheck, Stethoscope, Sparkles, CheckCircle, Activity, HeartHandshake } from 'lucide-react';

interface WhyChooseUsProps {
  doctorImage: string;
  techImage: string;
  onOpenBooking: () => void;
}

export default function WhyChooseUs({ doctorImage, techImage, onOpenBooking }: WhyChooseUsProps) {
  
  const pillars = [
    {
      id: 'p1',
      titleAr: 'كفاءات طبية واستشاريين كبار',
      titleEn: 'Elite Medical Staff',
      descAr: 'تحت إشراف استشاري جراحة وزراعة الأسنان وعضو هيئة الأطباء بمستشفى ميت غمر العام. نضم أفضل الخبرات الأكاديمية والعملية لضمان علاج آمن وحلول تجميلية متطورة تلائم حالتك.',
      image: doctorImage,
      icon: UserCheck,
      details: ['أعضاء الجمعية المصرية لتجميل الأسنان', 'خبرات تزيد عن 15 عاماً في العمل الجراحي والتجميلي', 'أطباء بدرجة استشاريين ومدرسين معتمدين']
    },
    {
      id: 'p2',
      titleAr: 'تكنولوجيا الأسنان الرقمية الأحدث',
      titleEn: 'Advanced 3D Dental Tech',
      descAr: 'نستعين بأحدث أجهزة المسح الرقمي الفموي ثلاثي الأبعاد (Intraoral Scanner) وأجهزة الأشعة الرقمية الحديثة. نخطط لكل زرعة أو تقويم بدقة ميكروسكوبية لضمان نتائج فورية متناهية الجمال.',
      image: techImage,
      icon: Activity,
      details: ['دقة تصميم رقمية 100% بدون طبعات سيليكون تقليدية', 'تصميم الابتسامة الموجه بالكمبيوتر DSD قبل بدء العلاج', 'أجهزة أشعة ذكية منخفضة الانبعاثات تماماً']
    },
    {
      id: 'p3',
      titleAr: 'تعقيم كامل ومغلق Class-B',
      titleEn: 'Strict Class-B Sterilization',
      descAr: 'نطبق أدق بروتوكولات مكافحة العدوى والتعقيم. تُغسل الأدوات بالموجات الصوتية ثم تُعبأ حرارياً وتوضع داخل جهاز الأوتوكلاف الألماني المتطور لقتل الفيروسات والبكتيريا بالكامل.',
      image: '/src/assets/images/sterilization_equipment_1782801859693.jpg',
      icon: ShieldCheck,
      details: ['أجهزة Class-B Autoclave ذات معايير الاتحاد الأوروبي المعتمدة', 'كواشف كيميائية داخل وخارج العبوات لتوثيق سلامة التعقيم', 'أدوات استخدام فردي تُفتح أمام المريض بالكامل']
    },
    {
      id: 'p4',
      titleAr: 'طب أسنان مريح وبدون ألم',
      titleEn: 'Painless Gentle Comfort',
      descAr: 'نكسر حاجز الخوف التقليدي من عيادات الأسنان. بفضل أنظمة التخدير الموضعي المزدوجة المتطورة والموجات الصوتية الدقيقة، ستحصل على رعاية مريحة وسلسة تضمن لك الراحة والهدوء.',
      image: '/src/assets/images/painless_dental_comfort_1782801876969.jpg',
      icon: HeartHandshake,
      details: ['تقنيات تخدير فائق النعومة مهدئ للأعصاب', 'استراحة وتصميم مريح للعيادة لتقليل مستويات التوتر', 'فريق رعاية متعاطف ومستمع لكل تفاصيل شكواك']
    }
  ];

  return (
    <section 
      id="why-choose-us"
      className="py-24 bg-slate-50 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 text-sky-600 rounded-full text-xs font-bold font-sans">
            <Sparkles className="w-3.5 h-3.5" />
            <span>لماذا عيادة Azure؟</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            ما يجعلنا الخيار الأول لابتسامتك
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            نسعى جاهدين لتقديم معايير علاجية تماثل أرقى المراكز الطبية الأوروبية في قلب ميت غمر. الالتزام بالدقة، الجودة، وبناء الثقة هو جوهر رسالتنا.
          </p>
        </div>

        {/* ALTERNATING SPLIT LAYOUTS */}
        <div className="space-y-24">
          {pillars.map((p, idx) => {
            const IconComp = p.icon;
            // Alternates image placement: even is Left, odd is Right on desktop
            const isImageLeft = idx % 2 === 1;

            return (
              <div 
                id={`pillar-section-${p.id}`}
                key={p.id}
                className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
              >
                {/* Image Column */}
                <div className={`col-span-12 lg:col-span-6 ${
                  isImageLeft ? 'lg:order-first' : 'lg:order-last'
                }`}>
                  <div className="relative">
                    {/* Floating background framing decorations */}
                    <div className="absolute inset-4 -right-1 -bottom-4 border-2 border-dashed border-sky-200 rounded-[28px] pointer-events-none" />
                    
                    <div className="relative rounded-[28px] overflow-hidden aspect-[3/2] shadow-xl border border-white">
                      <img 
                        src={p.image} 
                        alt={p.titleAr} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent" />
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="col-span-12 lg:col-span-6 text-right space-y-5" dir="rtl">
                  <div className="flex items-center gap-3">
                    <span className="p-2.5 bg-sky-50 text-sky-500 rounded-xl">
                      <IconComp className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">{p.titleAr}</h3>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono mt-0.5">{p.titleEn}</p>
                    </div>
                  </div>

                  <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                    {p.descAr}
                  </p>

                  {/* Bullet points checks */}
                  <div className="space-y-2.5 pt-2">
                    {p.details.map((detail, dIdx) => (
                      <div key={dIdx} className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 font-medium">
                        <span className="w-4 h-4 rounded-full bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                          <CheckCircle className="w-3 h-3" />
                        </span>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button
                      id={`btn-pillar-cta-${p.id}`}
                      onClick={onOpenBooking}
                      className="px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      استشر طبيبنا في هذه الخدمة
                    </button>
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
