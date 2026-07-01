import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Phone, ArrowUp, CalendarDays, ExternalLink, HelpCircle } from 'lucide-react';
import { CLINIC_CONTACT } from '../data';

interface FloatingControlsProps {
  onOpenBooking: () => void;
}

export default function FloatingControls({ onOpenBooking }: FloatingControlsProps) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll progress percentage
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }

      // Show back to top if scrolled past 400px
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWhatsAppRedirect = () => {
    const text = 'مرحباً عيادة Azure Dental Clinic، أود الاستفسار عن كشف واستشارة تجميلية للأسنان من فضلك.';
    window.open(`https://wa.me/${CLINIC_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <>
      {/* 1. Scroll Progress indicator line at top */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-sky-400 via-sky-500 to-blue-600 transition-all duration-100"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* 2. Floating Action Controls Column (Bottom Right on RTL, or Bottom Left) */}
      <div className="fixed bottom-24 md:bottom-6 left-6 z-35 flex flex-col gap-3">
        
        {/* WhatsApp Chat Bubble */}
        <button
          id="floating-whatsapp-bubble"
          onClick={handleWhatsAppRedirect}
          className="w-14 h-14 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-emerald-600 hover:scale-105 active:scale-95 transition-all relative group cursor-pointer"
          title="محادثة واتساب فورية"
        >
          <MessageSquare className="w-6 h-6 fill-white" />
          {/* Subtle pulse ripple */}
          <span className="absolute inset-0 rounded-full bg-emerald-500 -z-10 animate-ping opacity-25" />
          
          {/* Tooltip on hover */}
          <span className="absolute left-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            تواصل عبر الواتساب
          </span>
        </button>

        {/* Phone Call Bubble */}
        <a
          id="floating-phone-bubble"
          href={`tel:${CLINIC_CONTACT.phone}`}
          className="w-14 h-14 bg-sky-500 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-sky-600 hover:scale-105 active:scale-95 transition-all relative group"
          title="اتصال هاتف فوري"
        >
          <Phone className="w-5 h-5 fill-white" />
          
          {/* Tooltip on hover */}
          <span className="absolute left-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
            اتصل بنا هاتفياً
          </span>
        </a>

        {/* Back To Top Trigger Button */}
        <AnimatePresence>
          {showBackToTop && (
            <motion.button
              id="floating-back-to-top-btn"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={scrollToTop}
              className="w-14 h-14 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all group focus:outline-none"
              title="العودة لأعلى الصفحة"
            >
              <ArrowUp className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
            </motion.button>
          )}
        </AnimatePresence>

      </div>

      {/* 3. Sticky mobile appointment trigger bar (Bottom Sticky of screen on mobile viewport only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-100 p-3 z-30 flex gap-2.5 shadow-xl">
        <button
          id="mobile-sticky-booking-btn"
          onClick={onOpenBooking}
          className="flex-1 py-3 bg-sky-500 text-white font-extrabold text-sm rounded-xl text-center shadow-md shadow-sky-500/10 cursor-pointer"
        >
          احجز موعدك الآن
        </button>
        <a
          id="mobile-sticky-whatsapp-btn"
          href={`https://wa.me/${CLINIC_CONTACT.whatsapp}`}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-3 bg-emerald-500 text-white rounded-xl flex items-center justify-center shadow-md"
        >
          <MessageSquare className="w-5 h-5 fill-white" />
        </a>
      </div>
    </>
  );
}
