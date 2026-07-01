import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, ShieldAlert, Sparkles, Smile, Flame, Ban, CheckCircle2, 
  HelpCircle, ChevronLeft, ArrowLeft, PhoneCall, Stethoscope, BriefcaseMedical 
} from 'lucide-react';

interface TipCategory {
  id: string;
  tabTitleAr: string;
  icon: React.ReactNode;
  headingAr: string;
  summaryAr: string;
  immediateActionsAr: string[];
  forbiddenActionsAr: string[];
  urgencyLevelAr: 'حرجة جداً' | 'متوسطة الأهمية' | 'نصائح وقائية هامة';
  urgencyColor: string;
}

export default function DentalTipsHub() {
  const [activeCategoryId, setActiveCategoryId] = useState<string>('pain');

  const categories: TipCategory[] = [
    {
      id: 'pain',
      tabTitleAr: 'ألم مفاجئ شديد',
      icon: <Flame className="w-5 h-5" />,
      headingAr: 'إرشادات السيطرة على آلام الأسنان المفاجئة والشديدة',
      summaryAr: 'آلام الأسنان المفاجئة قد تكون ناتجة عن التهاب عصب عميق أو تسوس مهمل. إليك الإجراءات الوقائية الفورية لتهدئة الألم لحين زيارة الطبيب الأخصائي فورا.',
      urgencyLevelAr: 'حرجة جداً',
      urgencyColor: 'bg-red-500 text-red-50',
      immediateActionsAr: [
        'المضمضة اللطيفة بالماء الفاتر المذاب فيه ملعقة ملح طعام لتعقيم الفم.',
        'استخدام مسكنات الألم ومضادات الالتهاب المعتادة (مثل الإيبوبروفين أو الباراسيتامول) حسب الجرعات الآمنة.',
        'وضع كمادة باردة أو ثلج ملفوف بقطعة قماش على الخد الخارجي المحاذي لمكان الألم لتقليل أي احتقان.'
      ],
      forbiddenActionsAr: [
        'تجنب تماماً وضع أقراص الإسبرين أو المسكنات مباشرة على اللثة أو السن المؤلم لئلا تسبب حروقاً كيميائية حادة للنسيج.',
        'تجنب تناول المشروبات الساخنة جداً أو الباردة جداً أو المأكولات السكرية والصلبة.',
        'تجنب إهمال الألم حتى لو خفّ مؤقتاً، فالتهاب العصب لا يلتئم تلقائياً ويجب معالجته لمنع تكون خراج عظمي.'
      ]
    },
    {
      id: 'extraction',
      tabTitleAr: 'بعد خلع السن/الضرس',
      icon: <BriefcaseMedical className="w-5 h-5" />,
      headingAr: 'الرعاية الوقائية بعد عمليات خلع الأسنان أو جراحات الزرع',
      summaryAr: 'الساعات الـ 24 الأولى بعد خلع السن أو غرس الزرعة هي الأهم لتأمين التئام الجرح وتجنب حدوث نزيف أو التهاب في العظم (المقبس الجاف).',
      urgencyLevelAr: 'نصائح وقائية هامة',
      urgencyColor: 'bg-emerald-500 text-emerald-50',
      immediateActionsAr: [
        'العض المستمر والضغط برفق على قطعة الشاش الطبية الموضعية لمدة ساعة كاملة بعد العملية.',
        'وضع كمادات باردة على الوجه الخارجي لمدة 10 دقائق كل ساعة لتقليل فرص حدوث تورم طبيعي.',
        'الالتزام بتناول الأغذية اللينة والباردة (مثل الزبادي، الجبن، الآيس كريم) بعد زوال تأثير البنج الموضعي.'
      ],
      forbiddenActionsAr: [
        'تجنب تماماً البصق، والمضمضة، واستخدام الماصة (الشفاطة) للشرب لمدة 24 ساعة، لأن ذلك يفتت الخثرة الدموية ويسبب النزيف.',
        'تجنب لمس مكان الجرح باللسان أو باليد لمنع انتقال الميكروبات.',
        'الامتناع التام عن التدخين والمشروبات الغازية والكحولية لمدة 48 ساعة على الأقل.'
      ]
    },
    {
      id: 'aligner',
      tabTitleAr: 'العناية بالتقويم الشفاف',
      icon: <Smile className="w-5 h-5" />,
      headingAr: 'إرشادات المحافظة على التقويم الشفاف (Clear Aligners)',
      summaryAr: 'لضمان تحرك الأسنان بسلاسة بالغة وفقاً للمخطط الرقمي ثلاثي الأبعاد والحفاظ على نقاء التقويم غير المرئي دون روائح أو بكتيريا.',
      urgencyLevelAr: 'متوسطة الأهمية',
      urgencyColor: 'bg-sky-500 text-sky-50',
      immediateActionsAr: [
        'الالتزام بارتداء قوالب التقويم لمدة لا تقل عن 20 إلى 22 ساعة يومياً لتحقيق النتيجة المطلوبة في موعدها.',
        'تنظيف القوالب الشفافة بالفرشاة والماء الفاتر والصابون الطبي اللطيف المخصص يومياً قبل ارتدائها.',
        'غسل وتنظيف الأسنان جيداً بالفرشاة والخيط الطبي بعد كل وجبة طعام وقبل إعادة وضع القالب الشفاف.'
      ],
      forbiddenActionsAr: [
        'تجنب تناول أي طعام أو شرب السوائل الملونة (كالشاي، القهوة، الكركديه) أثناء ارتداء التقويم الشفاف لمنع تصبغه واصفراره.',
        'تجنب تماماً استخدام الماء الساخن أو المغلي لتنظيف القوالب، لأن الحرارة العالية تغير من الخصائص الفيزيائية وشكل البلاستيك الطبي.',
        'تجنب تنظيف القوالب بمعجون أسنان كاشط ومبيض لئلا يسبب خدوشاً دقيقة تذهب بلمعان وشفافية القالب المبتكرة.'
      ]
    },
    {
      id: 'emergency',
      tabTitleAr: 'كسر أو سقوط السن',
      icon: <ShieldAlert className="w-5 h-5" />,
      headingAr: 'إجراءات الطوارئ عند سقوط أو كسر سن طبيعي إثر حادث مفاجئ',
      summaryAr: 'إذا سقط سن كامل من مكانه بسبب صدمة، يمكن إعادة زراعته وتثبيته بنجاح في العيادة بنسبة تفوق 90% إذا تصرفت بدقة وسرعة في غضون 60 دقيقة فقط!',
      urgencyLevelAr: 'حرجة جداً',
      urgencyColor: 'bg-red-500 text-red-50',
      immediateActionsAr: [
        'التقاط السن الساقط من الجزء العلوي الأبيض (التاج) فقط، دون لمس أو حك الجذر السفلي نهائياً.',
        'غسل السن بلطف شديد بالماء الجاري لبضع ثوانٍ دون فرك إذا كان متسخاً.',
        'حفظ السن فوراً في وعاء صغير يحتوي على حليب طبيعي سائل، أو في فم المصاب بجانب الخد، والتوجه فوراً إلى عيادتنا.'
      ],
      forbiddenActionsAr: [
        'تجنب تماماً تجفيف السن الساقط بقطن أو مناديل ورقية جافة، لأن خلايا السن الحيوية ستموت فورا.',
        'تجنب غسل السن بكحول، معقمات، أو صابون حاد.',
        'تجنب الانتظار للغد؛ كل دقيقة لها ثمنها وفرص إنقاذ السن تتلاشى بعد مرور ساعتين خارج الفم.'
      ]
    }
  ];

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];

  return (
    <section 
      id="dental-tips-hub"
      className="py-24 bg-white relative overflow-hidden text-right"
    >
      {/* Visual background elements */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-slate-100 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-sky-50/60 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-xs font-bold font-sans">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>رعايتنا تمتد إلى منزلك</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            دليلك الطبي الإرشادي للوقاية وطوارئ الأسنان
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            لأن صحة فمك تهمنا في كل وقت، نضع بين يديك هذا الدليل التفاعلي السريع لتوجيهك حول التصرف الصحيح والآمن في حالات طوارئ الفم وكيفية المحافظة على نتائج تجميلك.
          </p>
        </div>

        {/* Workspace Layout Container with Tab Selector */}
        <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-4 sm:p-8 shadow-sm">
          
          {/* Horizontal / Grid Tab Selector buttons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8" dir="rtl">
            {categories.map((cat) => {
              const isActive = cat.id === activeCategoryId;
              return (
                <button
                  id={`btn-tips-tab-${cat.id}`}
                  key={cat.id}
                  onClick={() => setActiveCategoryId(cat.id)}
                  className={`py-3.5 px-4 rounded-2xl border font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer focus:outline-none ${
                    isActive 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                      : 'bg-white border-slate-100 text-slate-600 hover:border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <span className={`${isActive ? 'text-sky-400' : 'text-slate-400'}`}>
                    {cat.icon}
                  </span>
                  <span>{cat.tabTitleAr}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Content Presenter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-white border border-slate-100/80 rounded-2xl p-6 sm:p-8 space-y-8"
              dir="rtl"
            >
              {/* Header Title with urgency rating */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <h3 className="font-black text-slate-950 text-base sm:text-lg lg:text-xl">
                    {activeCategory.headingAr}
                  </h3>
                  <p className="text-slate-500 text-xs sm:text-sm">
                    {activeCategory.summaryAr}
                  </p>
                </div>

                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold shrink-0 font-sans ${activeCategory.urgencyColor}`}>
                  درجة الخطورة: {activeCategory.urgencyLevelAr}
                </span>
              </div>

              {/* Dual Dos & Don'ts Columns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                
                {/* Column 1: Dos (CheckCircle) */}
                <div className="space-y-4">
                  <h4 className="font-bold text-emerald-800 text-sm flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span>خطوات ينصح بفعلها فوراً (DO):</span>
                  </h4>

                  <div className="space-y-3">
                    {activeCategory.immediateActionsAr.map((act, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        <span className="w-5 h-5 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✓</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Column 2: Don'ts (Ban/Cross) */}
                <div className="space-y-4">
                  <h4 className="font-bold text-rose-800 text-sm flex items-center gap-2 px-3 py-2 bg-rose-50 rounded-xl">
                    <Ban className="w-5 h-5 text-rose-500 shrink-0" />
                    <span>أفعال يجب تجنبها تماماً (DON'T):</span>
                  </h4>

                  <div className="space-y-3">
                    {activeCategory.forbiddenActionsAr.map((act, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-4 bg-slate-50 rounded-2xl text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                        <span className="w-5 h-5 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">✕</span>
                        <span>{act}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Urgency Hotline CTA footer */}
              {activeCategory.urgencyLevelAr === 'حرجة جداً' && (
                <div className="p-4 sm:p-5 bg-rose-50 border border-rose-100/80 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3 text-right">
                    <span className="p-2.5 bg-rose-500 text-white rounded-xl shrink-0 animate-pulse">
                      <PhoneCall className="w-5 h-5" />
                    </span>
                    <div>
                      <h5 className="font-bold text-rose-950 text-sm sm:text-base">حالة طوارئ أسنان عاجلة؟ عيادتنا ترحب بك فوراً</h5>
                      <p className="text-xs text-rose-700/90 mt-0.5">نوفر قسم طوارئ مخصص لاستقبال الآلام الحادة وعلاجات كسر وسقوط الأسنان دون انتظار.</p>
                    </div>
                  </div>

                  <a
                    id="tips-emergency-call"
                    href="tel:+201000000000"
                    className="w-full sm:w-auto px-5 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-rose-500/10 flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>اتصل هاتفياً بالطبيب المناوب</span>
                    <PhoneCall className="w-4 h-4 shrink-0" />
                  </a>
                </div>
              )}

            </motion.div>
          </AnimatePresence>

        </div>

      </div>
    </section>
  );
}
