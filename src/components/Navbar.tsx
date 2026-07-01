import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Calendar, CalendarDays, Menu, X, ArrowLeftRight, UserRoundCheck, ShieldPlus } from 'lucide-react';
import { CLINIC_CONTACT } from '../data';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenMyBookings: () => void;
  onOpenAdmin: () => void;
  bookingsCount: number;
  activePatient?: any;
  onLogout?: () => void;
  isAdmin?: boolean;
  onAdminLogout?: () => void;
}

export default function Navbar({ 
  onOpenBooking, 
  onOpenMyBookings, 
  onOpenAdmin, 
  bookingsCount, 
  activePatient, 
  onLogout,
  isAdmin = false,
  onAdminLogout
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { labelAr: 'الرئيسية', labelEn: 'Home', href: '#home' },
    { labelAr: 'خدماتنا', labelEn: 'Services', href: '#services' },
    { labelAr: 'عروض حصرية', labelEn: 'Offers', href: '#offers' },
    { labelAr: 'أطباء أزور', labelEn: 'Doctors', href: '#doctors' },
    { labelAr: 'قبل وبعد', labelEn: 'Cases', href: '#cases' },
    { labelAr: 'التقنية المتقدمة', labelEn: 'Technology', href: '#tech' },
    { labelAr: 'أسئلة شائعة', labelEn: 'FAQ', href: '#faq' },
  ];

  const handleLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav 
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-row-reverse">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-right">
              <span className="text-sm font-bold text-slate-900 font-sans tracking-wide flex items-center gap-1">
                AZURE DENTAL
                <ShieldPlus className="w-4 h-4 text-sky-500 shrink-0 inline-block" />
              </span>
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono font-medium leading-none">Mit Ghamr Clinic</span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <div className="hidden md:flex items-center gap-x-5 lg:gap-x-7" dir="rtl">
            {navLinks.map((link) => (
              <a
                id={`nav-link-${link.href.replace('#', '')}`}
                key={link.href}
                href={link.href}
                className="text-slate-600 hover:text-sky-500 text-[13px] font-bold transition-colors relative group"
              >
                {link.labelAr}
                <span className="absolute bottom-[-4px] right-0 left-0 h-0.5 bg-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-right" />
              </a>
            ))}
          </div>

          {/* CTA Buttons (Desktop) */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              id="nav-booking-cta"
              onClick={onOpenBooking}
              className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-sky-500/10 hover:shadow-md hover:translate-y-[-1px] cursor-pointer"
            >
              احجز موعدك الآن
            </button>
            
            {activePatient ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-my-bookings-btn"
                  onClick={onOpenMyBookings}
                  className="px-4 py-2.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl transition-all border border-sky-100/60 flex items-center gap-1.5 relative cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span>الملف الطبي: {activePatient.name}</span>
                  <AnimatePresence>
                    {bookingsCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold font-mono"
                      >
                        {bookingsCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
                
                {onLogout && (
                  <button
                    id="nav-logout-btn"
                    onClick={onLogout}
                    className="p-2.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-all border border-red-100 flex items-center justify-center cursor-pointer"
                    title="تسجيل الخروج من الملف الطبي"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <button
                id="nav-my-bookings-btn"
                onClick={onOpenMyBookings}
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all border border-slate-100 flex items-center gap-1.5 relative cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-sky-500" />
                <span>دخول / إنشاء حساب</span>
              </button>
            )}

            {isAdmin && (
              <div className="flex items-center gap-1">
                <button
                  id="nav-admin-btn"
                  onClick={onOpenAdmin}
                  className="px-3 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-amber-500/20"
                  title="لوحة الإدارة الإشرافية"
                >
                  <UserRoundCheck className="w-4 h-4" />
                  <span>لوحة الإدارة</span>
                </button>
                {onAdminLogout && (
                  <button
                    id="nav-admin-logout-btn"
                    onClick={onAdminLogout}
                    className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-all border border-amber-200 flex items-center justify-center cursor-pointer"
                    title="تسجيل خروج الإشراف"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Mobile Buttons (Navbar right/left layout) */}
          <div className="flex items-center gap-2 md:hidden">
            {isAdmin && (
              <button
                id="mobile-admin-btn"
                onClick={onOpenAdmin}
                className="p-2 bg-amber-500 text-white rounded-xl cursor-pointer shadow-sm"
                title="بوابة الإدارة"
              >
                <UserRoundCheck className="w-4 h-4" />
              </button>
            )}
            {activePatient ? (
              <button
                id="mobile-my-bookings-btn"
                onClick={onOpenMyBookings}
                className="px-2.5 py-1.5 bg-sky-50 border border-sky-100/80 rounded-xl relative cursor-pointer text-sky-700 text-[10px] font-extrabold flex items-center gap-1"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                <span>ملفي</span>
                {bookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {bookingsCount}
                  </span>
                )}
              </button>
            ) : (
              <button
                id="mobile-my-bookings-btn"
                onClick={onOpenMyBookings}
                className="p-2 bg-slate-50 border border-slate-100 rounded-xl relative cursor-pointer"
              >
                <CalendarDays className="w-4 h-4 text-sky-500" />
                {bookingsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {bookingsCount}
                  </span>
                )}
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-b border-slate-100 overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-1.5 flex flex-col text-right" dir="rtl">
              {navLinks.map((link) => (
                <a
                  id={`mobile-nav-link-${link.href.replace('#', '')}`}
                  key={link.href}
                  href={link.href}
                  onClick={handleLinkClick}
                  className="block px-3 py-2.5 text-slate-700 hover:text-sky-500 font-bold text-sm rounded-xl hover:bg-slate-50 transition-all"
                >
                  {link.labelAr}
                </a>
              ))}
              <div className="pt-4 flex flex-col gap-2.5">
                {activePatient ? (
                  <>
                    <button
                      id="mobile-nav-portal"
                      onClick={() => {
                        onOpenMyBookings();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-sky-50 text-sky-700 border border-sky-100 text-center text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                      <span>الملف الطبي لـ {activePatient.name}</span>
                    </button>
                    {onLogout && (
                      <button
                        id="mobile-nav-logout"
                        onClick={() => {
                          onLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-2 bg-red-50 text-red-600 border border-red-100 text-center text-xs font-bold rounded-xl cursor-pointer"
                      >
                        تسجيل الخروج من الملف الطبي
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    id="mobile-nav-login"
                    onClick={() => {
                      onOpenMyBookings();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full py-2.5 bg-slate-100 text-slate-700 border border-slate-200 text-center text-xs font-bold rounded-xl cursor-pointer"
                  >
                    دخول / إنشاء حساب جديد
                  </button>
                )}

                {isAdmin && (
                  <>
                    <button
                      id="mobile-nav-admin"
                      onClick={() => {
                        onOpenAdmin();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full py-2.5 bg-amber-500 text-white text-center text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-sm shadow-amber-500/10"
                    >
                      <UserRoundCheck className="w-4 h-4" />
                      <span>فتح لوحة الإدارة</span>
                    </button>
                    {onAdminLogout && (
                      <button
                        id="mobile-nav-admin-logout"
                        onClick={() => {
                          onAdminLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full py-2 bg-amber-50 text-amber-700 border border-amber-200 text-center text-xs font-bold rounded-xl cursor-pointer"
                      >
                        تسجيل الخروج من الإدارة
                      </button>
                    )}
                  </>
                )}
                
                <button
                  id="mobile-nav-booking-cta"
                  onClick={() => {
                    onOpenBooking();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-3 bg-sky-500 text-white text-center text-sm font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  احجز موعدك الآن
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
