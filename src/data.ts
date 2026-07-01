import { Service, Doctor, Testimonial, FAQItem } from './types';

export const CLINIC_CONTACT = {
  phone: '01039591109',
  phoneFormatted: '010 3959 1109',
  whatsapp: '201039591109',
  addressAr: 'ميت غمر، شارع 26 يوليو، برج فريدة، أمام سلم المنصورة، خلف صيدلية وجيه',
  addressEn: 'Farida Tower, 26th of July St., Mit Ghamr, in front of Mansoura Stairs, behind Wageeh Pharmacy',
  hoursAr: 'يومياً من 2:00 ظهراً حتى 10:00 مساءً (ماعدا الجمعة)',
  hoursEn: 'Daily 2:00 PM - 10:00 PM (Except Friday)'
};

export const SERVICES: Service[] = [
  {
    id: 'cosmetic-fillings',
    titleAr: 'الحشوات التجميلية',
    titleEn: 'Cosmetic Fillings',
    descAr: 'حشوات تجميلية ذكية متطابقة تماماً مع لون الأسنان الطبيعي لابتسامة متناسقة.',
    descEn: 'Natural tooth-colored composite restorations matching your exact enamel shades.',
    iconName: 'Sparkles',
    detailsAr: [
      'استخدام أفضل المواد الألمانية والأمريكية',
      'دمج تام مع طبقات السن الطبيعية',
      'مقاومة فائقة للتصبغ وتدوم لسنوات طويلة',
      'علاج التسوسات السطحية وإعادة بناء الضروس بدقة متناهية'
    ],
    duration: '30-45 دقيقة'
  },
  {
    id: 'root-canal',
    titleAr: 'حشو العصب الفوري',
    titleEn: 'Painless Root Canal',
    descAr: 'تنظيف قنوات العصب بأحدث الأجهزة الدوارة بجلسة واحدة آمنة تماماً وبدون ألم.',
    descEn: 'Advanced single-session painless root canal therapy using state-of-the-art rotary instruments.',
    iconName: 'ShieldAlert',
    detailsAr: [
      'استخدام جهاز الـ Rotary المتطور لتنظيف دقيق وميكروسكوبي',
      'تخدير موضعي مزدوج الفعالية لضمان تجربة خالية من الألم بنسبة 100%',
      'حشو ثلاثي الأبعاد لمنع عودة البكتيريا أو الالتهابات',
      'جلسة واحدة سريعة لحماية وحفظ الأسنان الطبيعية'
    ],
    duration: '45-60 دقيقة'
  },
  {
    id: 'prosthodontics',
    titleAr: 'تركيبات وتيجان الأسنان',
    titleEn: 'Crowns & Bridges',
    descAr: 'تيجان الزيركون وإيماكس فائقة النقاء لاستعادة المظهر الجمالي والوظيفة الحيوية.',
    descEn: 'Fixed Zirconia and E-max crowns and bridges fabricated with digital precision.',
    iconName: 'Award',
    detailsAr: [
      'تصميم رقمي ثلاثي الأبعاد متطابق مع عضة الفك الطبيعية',
      'تركيب تيجان زيركون (Zirconia) ذات صلابة فائقة ومظهر طبيعي',
      'تيجان إيماكس (E-Max) فائقة الشفافية للأسنان الأمامية',
      'ضمان معتمد على المواد والتركيب لسنوات ممتدة'
    ],
    duration: 'على جلستين'
  },
  {
    id: 'dental-implants',
    titleAr: 'زراعة الأسنان الرقمية',
    titleEn: 'Dental Implants',
    descAr: 'استعادة أسنانك المفقودة بأحدث أنظمة الزراعة الألمانية الفورية وبدون جراحة معقدة.',
    descEn: 'Permanent dental implants using German surgical guides for minimal downtime and absolute precision.',
    iconName: 'Activity',
    detailsAr: [
      'زراعات تيتانيوم حيوية سريعة الاندماج العظمي',
      'تصميم الدليل الجراحي الرقمي لتجنب الشقوق والنزيف',
      'نسب نجاح تفوق 98% تحت إشراف نخبة من كبار الاستشاريين',
      'إمكانية الزراعة الفورية في نفس يوم الخلع'
    ],
    duration: 'جلسات متعددة'
  },
  {
    id: 'orthodontics',
    titleAr: 'تقويم الأسنان الحديث',
    titleEn: 'Orthodontics',
    descAr: 'تقويم معدني وشفاف غير مرئي لتعديل مظهر الفك والأسنان بمستويات ضغط مريحة.',
    descEn: 'Custom metal braces and clear aligners to design your perfect bite alignment.',
    iconName: 'HeartHandshake',
    detailsAr: [
      'تقويم شفاف (Invisible Aligners) غير مرئي ومريح قابل للإزالة',
      'تقويم معدني وخزفي كلاسيكي فائق الدقة',
      'خطط علاجية رقمية ثلاثية الأبعاد تظهر النتيجة قبل البدء',
      'متابعة دورية مريحة وتسهيلات في السداد على مدار فترة العلاج'
    ],
    duration: 'متابعة شهرية'
  },
  {
    id: 'hollywood-smile',
    titleAr: 'تجميل وهوليود سمايل',
    titleEn: 'Hollywood Smile',
    descAr: 'تصميم الابتسامة الرقمي وقشور الفينير لتغيير جذري ناصع البياض ومتألق للابتسامة.',
    descEn: 'Digital Smile Design and ultra-thin veneers for a breathtakingly bright and beautiful smile.',
    iconName: 'Smile',
    detailsAr: [
      'تصميم الابتسامة الرقمي (Digital Smile Design) الملائم لملامح وجهك',
      'عدسات الفينير واللومينير فائقة النحافة بدون برد جائر لطبقة المينا',
      'تبييض الأسنان بالضوء البارد والليزر في جلسة واحدة مدتها 45 دقيقة',
      'تعديل وإعادة تشكيل اللثة بالليزر التجميلي بدون نزيف أو خياطة'
    ],
    duration: 'جلسة أو جلستين'
  }
];

export const DOCTORS: Doctor[] = [
  {
    id: 'dr-amr',
    nameAr: 'د. عمرو العدوي',
    nameEn: 'Dr. Amr El-Adawy',
    roleAr: 'استشاري جراحة وزراعة الأسنان',
    roleEn: 'Consultant of Oral Surgery & Implantology',
    image: 'doctor_expert_portrait',
    bioAr: 'استشاري جراحة الفم والوجه والفكين، وعضو هيئة الأطباء الأخصائيين بمستشفى ميت غمر العام. يمتلك خبرة تفوق 15 عاماً في زراعة الأسنان الدقيقة والعمليات الجراحية المتقدمة.',
    bioEn: 'Senior Consultant of Oral Surgery & Maxillofacial Implantology, core member of Mit Ghamr General Hospital specialist staff. Over 15 years of clinical expertise in computer-guided implants and advanced surgical techniques.',
    experience: '15+ سنة خبرة',
    certificates: [
      'دبلوم زراعة الأسنان من جامعة عين شمس',
      'عضو الجمعية المصرية لزراعة الأسنان',
      'زمالة جراحة الوجه والفكين وزراعة الأسنان الألمانية',
      'استشاري جراحة وزراعة الأسنان بمستشفى ميت غمر العام'
    ]
  },
  {
    id: 'dr-basel',
    nameAr: 'د. باسل المرسي',
    nameEn: 'Dr. Basel El-Morsi',
    roleAr: 'أخصائي تجميل وتقويم الأسنان',
    roleEn: 'Specialist of Cosmetic Dentistry & Orthodontics',
    image: '/src/assets/images/dr_basel_portrait_1782801845110.jpg',
    bioAr: 'أخصائي تجميل وتصميم الابتسامة الرقمية وعضو الجمعية المصرية لتجميل الأسنان. متخصص في تركيبات الإيماكس وعدسات الفينير والتقويم الشفاف الحديث.',
    bioEn: 'Specialist in Digital Smile Design, Veneers, and Modern Aligners. Active member of the Egyptian Society of Esthetic Dentistry, dedicated to creating gorgeous and natural facial-guided smile designs.',
    experience: '8+ سنوات خبرة',
    certificates: [
      'ماجستير التركيبات التجميلية وتصميم الابتسامة',
      'شهادة معتمدة لتصميم الابتسامة الرقمي DSD',
      'عضو الجمعية المصرية لتجميل الأسنان',
      'عضو الجمعية العربية لتقويم الأسنان'
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'أحمد م.',
    treatment: 'زراعة أسنان رقمية',
    quote: 'تجربة ممتازة بحق! كنت متخوفاً جداً من عملية زراعة الأسنان والشق الجراحي، لكن مع الدليل الرقمي تم كل شيء بسرعة فائقة وبدون أي ألم يذكر. النتيجة طبيعية جداً والمتابعة مريحة.',
    rating: 5,
    date: 'منذ أسبوعين'
  },
  {
    id: 't2',
    name: 'سارة ك.',
    treatment: 'تجميل وعدسات فينير',
    quote: 'أزور هي أفضل عيادة أسنان في ميت غمر بالكامل. الدكتورة سارة شرحت لي التفاصيل وصممت لي الابتسامة على الكمبيوتر قبل البداية. الابتسامة غيرت شكلي تماماً وزادت ثقتي بنفسي.',
    rating: 5,
    date: 'منذ شهر'
  },
  {
    id: 't3',
    name: 'محمود ع.',
    treatment: 'حشو عصب فوري',
    quote: 'عملت حشو عصب بجلسة واحدة تحت الميكروسكوب والروتاري. لم أشعر بأي ألم طوال الجلسة وحتى بعدها. التعقيم مبهر والأدوات تفتح أمامي. أشكر دكتور محمد على ذوقه ومهنيته العالية.',
    rating: 5,
    date: 'منذ 3 أسابيع'
  }
];

export const FAQS: FAQItem[] = [
  {
    id: 'f1',
    question: 'هل فعلاً علاج الأسنان في عيادة Azure بدون ألم؟',
    answer: 'نعم تماماً. نستخدم تقنيات تخدير موضعي مزدوجة ومتقدمة مع حقن فائقة النعومة ومواد مهدئة للأعصاب. كما تساهم أجهزتنا الحديثة مثل الليزر التجميلي والمكشطة الصوتية الدوارة في إلغاء معظم الآلام التقليدية والاهتزازات المزعجة.',
    category: 'comfort'
  },
  {
    id: 'f2',
    question: 'كم تستغرق عملية زراعة الأسنان في العيادة؟',
    answer: 'بفضل تخطيط الـ 3D الرقمي والزرع الموجه، فإن وضع غرسة التيتانيوم نفسها لا يستغرق أكثر من 10 إلى 15 دقيقة داخل الغرفة المعقمة بالكامل، ويتم ذلك تحت تخدير موضعي بسيط بدون نزيف أو خياطة مزعجة.',
    category: 'implants'
  },
  {
    id: 'f3',
    question: 'ما هي معايير التعقيم المتبعة في العيادة؟',
    answer: 'نطبق بروتوكولات تعقيم عالمية صارمة (Class-B Autoclave) حيث تخضع كل أداة لغسيل ألتراسونيك، تعبئة في أكياس حرارية محكمة، تعقيم بالضغط البخاري، ولا تفتح الأكياس إلا أمام المريض مباشرة. كما نستخدم كواشف تعقيم كيميائية وفيزيائية لكل دورة.',
    category: 'safety'
  },
  {
    id: 'f4',
    question: 'هل يمكنني حجز موعد ومتابعة الحجز بالكامل عبر واتساب؟',
    answer: 'بالتأكيد. يمكنك الحجز مباشرة عبر الموقع هنا ليرسل طلبك بشكل فوري لفريق الاستقبال عبر واتساب، أو حجز جلسة استشارة وسيقوم منسق المواعيد بتأكيد الساعة الملائمة لك والإجابة على أي استفسارات.',
    category: 'booking'
  },
  {
    id: 'f5',
    question: 'هل تقدم العيادة تسهيلات أو تقسيط للخدمات العلاجية؟',
    answer: 'نعم، نوفر تسهيلات مريحة وتقسيط مرن لخدمات تقويم الأسنان وزراعة الأسنان المتعددة لتناسب كافة الميزانيات، مع تقديم باقات وعروض دورية حصرية.',
    category: 'payments'
  }
];
