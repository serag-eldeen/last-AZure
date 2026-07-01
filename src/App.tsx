import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import TrustBar from './components/TrustBar';
import OfferSection from './components/OfferSection';
import ServicesSection from './components/ServicesSection';
import WhyChooseUs from './components/WhyChooseUs';
import BeforeAfter from './components/BeforeAfter';
import DoctorsSection from './components/DoctorsSection';
import ClinicGallery from './components/ClinicGallery';
import Testimonials from './components/Testimonials';
import FAQSection from './components/FAQSection';
import Footer from './components/Footer';
import BookingModal from './components/BookingModal';
import MyBookings from './components/MyBookings';
import AdminDashboard from './components/AdminDashboard';
import SmileStudio from './components/SmileStudio';
import TreatmentJourney from './components/TreatmentJourney';
import ShadeSelector from './components/ShadeSelector';
import DentalTipsHub from './components/DentalTipsHub';
import FloatingControls from './components/FloatingControls';
import { Appointment } from './types';
import { initClinicDb } from './clinicDb';

export default function App() {
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [myBookingsOpen, setMyBookingsOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [preselectedServiceId, setPreselectedServiceId] = useState<string | undefined>(undefined);
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const [activePatient, setActivePatient] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dbReady, setDbReady] = useState(false);

  // Initialize Clinic Database on Mount
  useEffect(() => {
    initClinicDb().then(() => {
      setDbReady(true);
    });
  }, []);

  // Sync active patient and admin sessions
  const syncSessions = () => {
    // 1. Patient Session
    const activeSession = localStorage.getItem('azure_active_patient');
    if (activeSession && activeSession !== 'undefined' && activeSession !== 'null') {
      try {
        const patient = JSON.parse(activeSession);
        if (patient && patient.id) {
          setActivePatient(patient);
        } else {
          setActivePatient(null);
        }
      } catch (err) {
        console.error(err);
        setActivePatient(null);
      }
    } else {
      setActivePatient(null);
    }

    // 2. Admin Session
    const isAuthSession = sessionStorage.getItem('azure_admin_authenticated') === 'true';
    setIsAdmin(isAuthSession);
  };

  useEffect(() => {
    syncSessions();
  }, [myBookingsOpen, adminOpen, refreshTrigger]);

  const handleLogout = () => {
    localStorage.removeItem('azure_active_patient');
    setActivePatient(null);
    setRefreshTrigger(prev => !prev);
  };

  const handleAdminLogout = () => {
    sessionStorage.removeItem('azure_admin_authenticated');
    setIsAdmin(false);
    setAdminOpen(false);
    setRefreshTrigger(prev => !prev);
  };

  // Dynamic image paths for our custom generated premium clinic assets
  const clinicInteriorImg = '/src/assets/images/hero_clinic_interior_1782702865845.jpg';
  const digitalScannerImg = '/src/assets/images/advanced_dental_tech_1782702881731.jpg';
  const doctorPortraitImg = '/src/assets/images/doctor_expert_portrait_1782702895851.jpg';

  // Sync current bookings count on load and updates
  useEffect(() => {
    const existing = localStorage.getItem('azure_bookings');
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as Appointment[];
        setBookingsCount(parsed.length);
      } catch (err) {
        console.error(err);
      }
    }
  }, [bookingModalOpen, refreshTrigger, myBookingsOpen]);

  const handleOpenBooking = (serviceId?: string) => {
    setPreselectedServiceId(serviceId);
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (newApp: Appointment) => {
    setBookingsCount(prev => prev + 1);
    setRefreshTrigger(prev => !prev);
  };

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white antialiased">
        <div className="flex flex-col items-center max-w-md px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-sky-500 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-slate-800 text-sky-400 p-5 rounded-full border border-slate-700 shadow-2xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin text-sky-400">
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" strokeDasharray="16 6" />
                <path d="M12 6v6l4 2" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold mb-2">جاري تحميل السجلات والعيادة السحابية 🦷</h1>
          <p className="text-slate-400 text-xs leading-relaxed mb-6">
            يرجى الانتظار ثانية واحدة بينما نتصل بخادم PostgreSQL ونقوم بتحميل ملفات المرضى وجداول العمل...
          </p>
          <div className="w-48 bg-slate-800 rounded-full h-1 overflow-hidden border border-slate-700">
            <div className="bg-sky-400 h-full w-2/3 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 relative antialiased selection:bg-sky-500/20 selection:text-sky-500">
      
      {/* Dynamic sticky header */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        bookingsCount={bookingsCount}
        activePatient={activePatient}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        onAdminLogout={handleAdminLogout}
      />

      {/* Main Page Layout Content Flow */}
      <main className="flex-grow">
        
        {/* Section 1: Hero Visual Entrance */}
        <Hero 
          onOpenBooking={() => handleOpenBooking()} 
          heroImage={clinicInteriorImg}
        />

        {/* Section 2: Floating trust bar values */}
        <TrustBar />

        {/* Section 3: Exclusive Limited Promo details */}
        <OfferSection onOpenBooking={() => handleOpenBooking()} />

        {/* Section 4: Bento grid services list with technical details */}
        <ServicesSection onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Section 5: Clinial pillars split details (Doctors, Tech, Sterilization, Care) */}
        <WhyChooseUs 
          doctorImage={doctorPortraitImg}
          techImage={digitalScannerImg}
          onOpenBooking={() => handleOpenBooking()}
        />

        {/* Section 6: Interactive Drag-slider Before & After teeth alignment comparison */}
        <BeforeAfter />

        {/* Section 6b: Smart Interactive Smile & Comfort Assessment Studio */}
        <SmileStudio onOpenBooking={(id) => handleOpenBooking(id)} />

        {/* Section 6c: Smart Interactive Treatment Roadmap & Journey */}
        <TreatmentJourney />

        {/* Section 6d: Smart Interactive Cosmetic Smile Shade Selector */}
        <ShadeSelector />

        {/* Section 7: Specialist profiles and certifications */}
        <DoctorsSection 
          onOpenBooking={() => handleOpenBooking()}
          doctorPortraitImage={doctorPortraitImg}
        />

        {/* Section 8: True clinical photo gallery & full lightbox previews */}
        <ClinicGallery />

        {/* Section 9: Verified patient testimonials carousel */}
        <Testimonials />

        {/* Section 9b: Interactive Oral Health & Emergency Tips Hub */}
        <DentalTipsHub />

        {/* Section 10: General FAQs about comfort and booking */}
        <FAQSection />

      </main>

      {/* Modern dark slate interactive contact details footer */}
      <Footer 
        onOpenBooking={() => handleOpenBooking()}
        onOpenMyBookings={() => setMyBookingsOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      {/* Floating Call, WhatsApp, Scroll Progress & Sticky mobile buttons */}
      <FloatingControls onOpenBooking={() => handleOpenBooking()} />

      {/* INTERACTIVE POPUPS & DRAWERS */}
      
      {/* Multi-step appointment scheduling modal */}
      {bookingModalOpen && (
        <BookingModal 
          isOpen={bookingModalOpen}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
          initialServiceId={preselectedServiceId}
        />
      )}

      {/* Saved bookings list viewer slide-drawer */}
      {myBookingsOpen && (
        <MyBookings 
          isOpen={myBookingsOpen}
          onClose={() => setMyBookingsOpen(false)}
          triggerRefresh={refreshTrigger}
          onOpenBooking={() => {
            setMyBookingsOpen(false);
            handleOpenBooking();
          }}
          onOpenAdmin={() => {
            setMyBookingsOpen(false);
            setAdminOpen(true);
          }}
        />
      )}

      {/* Clinic Admin Dashboard Panel */}
      {adminOpen && (
        <AdminDashboard 
          isOpen={adminOpen}
          onClose={() => setAdminOpen(false)}
          triggerRefresh={refreshTrigger}
          onDataChanged={() => setRefreshTrigger(prev => !prev)}
        />
      )}

    </div>
  );
}
