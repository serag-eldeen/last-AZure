import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Clock, Users, ArrowLeft, Percent, MessageCircle, HelpCircle, CheckCircle2, BadgePercent } from 'lucide-react';
import { CLINIC_CONTACT } from '../data';

interface OfferSectionProps {
  onOpenBooking: () => void;
}

export default function OfferSection({ onOpenBooking }: OfferSectionProps) {
  // Countdown states
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 35, seconds: 48 });
  const [remainingSeats, setRemainingSeats] = useState(18);

  useEffect(() => {
    // Tick timer
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          // Reset to 24h
          return { hours: 23, minutes: 59, seconds: 59 };
        }
      });
    }, 1000);

    // Randomly update seats occasionally to simulate high demand
    const seatInterval = setInterval(() => {
      setRemainingSeats(prev => (prev > 5 ? prev - 1 : 18));
    }, 45000);

    return () => {
      clearInterval(timer);
      clearInterval(seatInterval);
    };
  }, []);

  const offers = [
    { text: 'كشف مبدئي مجاني بالكامل واستشارة تفصيلية', val: '100% خصم' },
    { text: 'خصم 50% على تنظيف الجير وتلميع الأسنان الدوار', val: '50% خصم' },
    { text: 'خصم 25% فوري على حشوات التجميل وعلاج العصب والتركيبات', val: '25% خصم' },
  ];

  return (
    <section 
      id="offers"
      className="py-24 bg-white relative overflow-hidden"
    >
      {/* Decorative background glow blobs */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-sky-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-600 rounded-full text-xs font-bold font-sans">
            <BadgePercent className="w-3.5 h-3.5" />
            <span>عرض حصري ومحدود</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            عروض حصرية لفترة محدودة جداً
          </h2>
          <p className="text-slate-500 text-sm sm:text-base leading-relaxed">
            احصل على أفضل رعاية طبية وتجميلية لأسنانك بأسعار استثنائية وبأحدث التقنيات الرقمية المعتمدة. سارع بحجز مكانك الآن!
          </p>
        </div>

        {/* Core Promo Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950 text-white rounded-[32px] p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          
          {/* Subtle Background Art */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-500/10 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Left Column: Countdown & Seat counter (col-span-12 lg:col-span-5) */}
          <div className="col-span-12 lg:col-span-5 flex flex-col items-center justify-center space-y-6 lg:border-r lg:border-slate-800 lg:pr-8" dir="rtl">
            
            {/* Ticking Countdown Title */}
            <div className="text-center space-y-1">
              <span className="text-xs text-sky-400 font-bold tracking-wider flex items-center gap-1.5 justify-center">
                <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                المتبقي على انتهاء التسجيل للعرض
              </span>
              
              {/* Digit Cards */}
              <div className="flex gap-2.5 justify-center mt-3 font-mono">
                {/* Hours */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xl font-bold tracking-tight text-white shadow-inner min-w-[48px]">
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">ساعة</span>
                </div>
                <span className="text-xl font-bold text-sky-500 self-start mt-2">:</span>
                {/* Minutes */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xl font-bold tracking-tight text-white shadow-inner min-w-[48px]">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">دقيقة</span>
                </div>
                <span className="text-xl font-bold text-sky-500 self-start mt-2">:</span>
                {/* Seconds */}
                <div className="flex flex-col items-center">
                  <div className="bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xl font-bold tracking-tight text-sky-400 shadow-inner min-w-[48px]">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1">ثانية</span>
                </div>
              </div>
            </div>

            {/* Live Progress Bar for remaining spots */}
            <div className="w-full max-w-sm space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  متبقي {remainingSeats} مقاعد حرة فقط اليوم
                </span>
                <span className="text-slate-400 font-mono">32 / 50 حجز مكتمل</span>
              </div>
              <div className="h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden p-[2px]">
                <motion.div 
                  className="h-full bg-gradient-to-r from-sky-400 to-emerald-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(32 / 50) * 100}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Direct Booking triggers */}
            <div className="w-full max-w-sm flex flex-col gap-2.5 pt-2">
              <button
                id="offer-booking-btn"
                onClick={onOpenBooking}
                className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black rounded-2xl transition-all shadow-lg shadow-sky-500/10 flex items-center justify-center gap-2 text-sm hover:translate-y-[-1px] cursor-pointer"
              >
                <span>احجز موعد العرض الخاص بك</span>
                <ArrowLeft className="w-4 h-4" />
              </button>

              <a
                id="offer-whatsapp-btn"
                href={`https://wa.me/${CLINIC_CONTACT.whatsapp}?text=${encodeURIComponent('مرحباً عيادة أزور، أود الاستفسار والحجز في العروض الحصرية المذكورة على الموقع.')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-transparent hover:bg-white/5 text-emerald-400 border border-slate-800 rounded-2xl transition-all flex items-center justify-center gap-2 text-xs font-bold"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>استفسار فوري عبر واتساب</span>
              </a>
            </div>

          </div>

          {/* Right Column: Key Details & Offers (col-span-12 lg:col-span-7) */}
          <div className="col-span-12 lg:col-span-7 text-right space-y-6 lg:pl-4" dir="rtl">
            <div className="space-y-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-widest font-mono">First 50 Bookings Package</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">باقة أول 50 حجز هذا الشهر</h3>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                تحرص عيادة Azure Dental Clinic على تلبية الاحتياجات التجميلية والعلاجية لأهالي ميت غمر والدقهلية. نقدم هذه الباقة المتكاملة لكل الحالات المتقدمة والروتينية.
              </p>
            </div>

            {/* Offer details lists */}
            <div className="space-y-3.5">
              {offers.map((off, index) => (
                <div 
                  id={`offer-item-${index}`}
                  key={index}
                  className="p-4 bg-slate-900/60 border border-slate-800/60 hover:border-slate-800 rounded-2xl flex items-center justify-between gap-4 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                    <p className="text-xs sm:text-sm text-slate-200 font-medium group-hover:text-white transition-colors">{off.text}</p>
                  </div>
                  <span className="shrink-0 text-xs font-extrabold text-sky-400 bg-sky-950/80 px-2.5 py-1.5 border border-sky-900/50 rounded-xl font-mono">
                    {off.val}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 leading-none">
              * تطبق الشروط والأحكام الطبية • العرض ساري حتى نهاية الأسبوع الحالي فقط أو عند اكتمال مقاعد الباقة المتاحة.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
