import React from 'react';
import { ShieldPlus, Phone, MapPin, Clock, MessageSquare, Heart, Sparkles, ExternalLink } from 'lucide-react';
import { CLINIC_CONTACT } from '../data';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
}

export default function Footer({ onOpenBooking, onOpenMyBookings, onOpenAdmin }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer 
      id="main-footer"
      className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-16 pb-8"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-b border-slate-900 pb-12 text-right" dir="rtl">
          
          {/* Logo and Intro block (col-span-12 md:col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-2 justify-start">
              <span className="text-white font-extrabold text-base tracking-wide flex items-center gap-1.5">
                AZURE DENTAL
                <ShieldPlus className="w-5 h-5 text-sky-400 inline-block shrink-0" />
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              عيادة رائدة لطب وتجميل الأسنان تجمع بين أرقى المعايير الطبية والتجهيزات الرقمية لتصميم الابتسامة الموجهة رقمياً بدقة وأمان وبدون ألم.
            </p>
            <div className="flex gap-3 pt-2">
              <a 
                id="footer-phone-call-btn"
                href={`tel:${CLINIC_CONTACT.phone}`}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-sky-500/10 hover:text-sky-400 flex items-center justify-center border border-slate-800 transition-all text-slate-400"
                title="اتصال هاتف"
              >
                <Phone className="w-4 h-4" />
              </a>
              <a 
                id="footer-whatsapp-chat-btn"
                href={`https://wa.me/${CLINIC_CONTACT.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-emerald-500/10 hover:text-emerald-400 flex items-center justify-center border border-slate-800 transition-all text-slate-400"
                title="واتساب"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick links (col-span-12 md:col-span-2) */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-sm">أقسام الموقع</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <a href="#home" className="hover:text-sky-400 transition-colors">الرئيسية</a>
              <a href="#services" className="hover:text-sky-400 transition-colors">خدماتنا</a>
              <a href="#offers" className="hover:text-sky-400 transition-colors">عروض حصرية</a>
              <a href="#doctors" className="hover:text-sky-400 transition-colors">أطباء العيادة</a>
              <a href="#cases" className="hover:text-sky-400 transition-colors">قبل وبعد</a>
              <a href="#faq" className="hover:text-sky-400 transition-colors">الأسئلة الشائعة</a>
            </div>
          </div>

          {/* Interactive features (col-span-12 md:col-span-2) */}
          <div className="md:col-span-2 space-y-3.5">
            <h4 className="text-white font-bold text-sm">بوابة المرضى</h4>
            <div className="flex flex-col gap-2.5 text-xs">
              <button onClick={onOpenBooking} className="text-right hover:text-sky-400 transition-colors focus:outline-none">حجز موعد استشارة</button>
              <button onClick={onOpenMyBookings} className="text-right hover:text-sky-400 transition-colors focus:outline-none">استعراض حوزاتي النشطة</button>
              <button onClick={onOpenAdmin} className="text-right hover:text-sky-400 transition-colors focus:outline-none flex items-center justify-start gap-1">
                <span>بوابة الإدارة</span>
                <span className="px-1 py-0.5 bg-slate-900 rounded text-[9px] text-sky-400 font-bold border border-slate-800">خاص</span>
              </button>
              <a href={`https://wa.me/${CLINIC_CONTACT.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-sky-400 transition-colors">استشارة واتساب عاجلة</a>
            </div>
          </div>

          {/* Location and address details (col-span-12 md:col-span-4) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-white font-bold text-sm">تفاصيل الاتصال والموقع</h4>
            
            <div className="space-y-3.5 text-xs">
              {/* Location */}
              <div className="flex gap-3 items-start justify-start">
                <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">مقر العيادة:</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    {CLINIC_CONTACT.addressAr}
                  </p>
                  {/* Google maps directions CTA link */}
                  <a 
                    id="directions-map-link"
                    href="https://maps.google.com/?q=26th+of+July+Street,+Mit+Ghamr,+Egypt" 
                    target="_blank" 
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[10px] text-sky-400 hover:text-sky-300 font-bold mt-2"
                  >
                    <span>فتح الموقع في خرائط Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Work Hours */}
              <div className="flex gap-3 items-start justify-start">
                <Clock className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">ساعات العمل الرسمية:</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {CLINIC_CONTACT.hoursAr}
                  </p>
                </div>
              </div>

              {/* Phone contact */}
              <div className="flex gap-3 items-start justify-start">
                <Phone className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-200">رقم الهاتف الموحد للعيادة:</p>
                  <a 
                    id="footer-call-num-link"
                    href={`tel:${CLINIC_CONTACT.phone}`} 
                    className="text-sm font-extrabold text-sky-400 font-mono tracking-wide mt-1 inline-block"
                  >
                    {CLINIC_CONTACT.phoneFormatted}
                  </a>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* Lower footer copyright */}
        <div className="pt-8 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <div className="flex items-center gap-1">
            <span>تم التصميم والتطوير بكل</span>
            <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
            <span>لصالح عيادة Azure Dental Clinic © {currentYear}</span>
          </div>
          <p className="font-mono text-[10px]">PREMIUM LUXURY HEALTHCARE SYSTEM</p>
        </div>

      </div>
    </footer>
  );
}
