import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Search,
  Activity,
  PhoneCall,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  MapPin,
  Ticket,
  LifeBuoy,
  Headphones,
  Sparkles,
  Sprout,
  FileText,
  AlertCircle,
  Building2,
  ChevronRight,
  Scale,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { PlatformStats, Announcement } from '../types/index.js';

interface HomeViewProps {
  stats: PlatformStats | null;
  onNavigate: (tab: string) => void;
  onBookNow: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ stats, onNavigate, onBookNow }) => {
  const { language, t } = useLanguage();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    fetch('/api/announcements')
      .then((res) => res.json())
      .then((data) => setAnnouncements(data))
      .catch((err) => console.error('Error fetching announcements:', err));
  }, []);

  return (
    <div className="space-y-10 pb-16">
      {/* ========================================================================= */}
      {/* 1. PUBLIC-SERVICE LIGHT HERO SECTION */}
      {/* ========================================================================= */}
      <section className="bg-white border-b border-[#D7DEE7] py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Heading, intro & action buttons */}
            <div className="lg:col-span-7 space-y-5">
              {/* Accent bar + Small Label */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-1 bg-[#FF9933] rounded-full" />
                <span className="text-xs font-bold tracking-widest text-[#16233B] uppercase">
                  {t('hero.kicker') || 'PARADOX AGRIPROCURE'}
                </span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172033] tracking-tight leading-tight">
                {t('hero.title')}
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-2xl">
                {t('hero.description')}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {/* Primary Saffron Button */}
                <button
                  type="button"
                  id="hero-book-procurement-slot-btn"
                  onClick={onBookNow}
                  className="px-5 py-3 bg-[#FF9933] hover:bg-[#e68524] text-stone-950 font-bold rounded-lg shadow-sm flex items-center gap-2 transition cursor-pointer active:scale-95"
                >
                  <CalendarDays className="w-4 h-4 text-stone-950" />
                  <span>{t('hero.bookSlot')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Secondary Navy-Bordered Buttons */}
                <button
                  type="button"
                  id="hero-track-booking-btn"
                  onClick={() => onNavigate('track')}
                  className="px-4 py-3 bg-white hover:bg-stone-50 text-[#16233B] border border-[#D7DEE7] hover:border-[#16233B] font-semibold text-sm rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Ticket className="w-4 h-4 text-[#FF9933]" />
                  <span>{t('hero.trackBooking')}</span>
                </button>

                <button
                  type="button"
                  id="hero-find-centre-btn"
                  onClick={() => onNavigate('centres')}
                  className="px-4 py-3 bg-white hover:bg-stone-50 text-[#16233B] border border-[#D7DEE7] hover:border-[#16233B] font-semibold text-sm rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-[#138808]" />
                  <span>{t('hero.findCentre')}</span>
                </button>

                <button
                  type="button"
                  id="hero-get-help-btn"
                  onClick={() => onNavigate('support')}
                  className="px-4 py-3 bg-white hover:bg-stone-50 text-[#16233B] border border-[#D7DEE7] hover:border-[#16233B] font-semibold text-sm rounded-lg shadow-xs transition flex items-center gap-2 cursor-pointer"
                >
                  <Headphones className="w-4 h-4 text-[#16233B]" />
                  <span>{t('hero.getHelp')}</span>
                </button>
              </div>

              {/* Sub-text badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-stone-600 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                  <span>{t('hero.badgeResponsive')}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                  <span>{t('hero.badgeFarmerFirst')}</span>
                </span>
                <span className="text-stone-300">•</span>
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-[#138808]" />
                  <span>Direct Benefit Transfer (DBT)</span>
                </span>
              </div>
            </div>

            {/* Right Column: "Today at a glance" panel */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl border border-[#D7DEE7] p-6 shadow-sm space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                  <h3 className="font-bold text-base text-[#172033]">
                    {t('stats.todayAtGlance')}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#138808]">
                    <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
                    {t('stats.liveInfo')}
                  </span>
                </div>

                {/* 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-[#F3F6FA] rounded-xl border border-[#D7DEE7]/60">
                    <span className="text-xs text-[#64748B] block font-medium">
                      {t('stats.serviceCentres')}
                    </span>
                    <span className="text-2xl font-black text-[#16233B] font-mono mt-0.5 block">
                      {stats ? stats.totalCentres : 46}
                    </span>
                    <span className="text-[10px] text-[#138808] font-semibold block mt-0.5">
                      All 36 States & UTs
                    </span>
                  </div>

                  <div className="p-3 bg-[#F3F6FA] rounded-xl border border-[#D7DEE7]/60">
                    <span className="text-xs text-[#64748B] block font-medium">
                      {t('stats.slotsAvailable')}
                    </span>
                    <span className="text-2xl font-black text-[#138808] font-mono mt-0.5 block">
                      {stats ? stats.availableSlots.toLocaleString() : '1,240'}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                      Open for booking
                    </span>
                  </div>

                  <div className="p-3 bg-[#F3F6FA] rounded-xl border border-[#D7DEE7]/60">
                    <span className="text-xs text-[#64748B] block font-medium">
                      {t('stats.operatingHours')}
                    </span>
                    <span className="text-sm font-bold text-[#172033] font-mono mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#FF9933]" />
                      08:00–18:00
                    </span>
                    <span className="text-[10px] text-[#64748B] font-medium block mt-0.5">
                      Mon - Sat Working
                    </span>
                  </div>

                  <div className="p-3 bg-[#F3F6FA] rounded-xl border border-[#D7DEE7]/60">
                    <span className="text-xs text-[#64748B] block font-medium">
                      {t('stats.kisanCallCentre')}
                    </span>
                    <a
                      href="tel:18001801551"
                      className="text-xs font-bold text-[#16233B] hover:text-[#FF9933] font-mono mt-1 block transition"
                    >
                      1800-180-1551
                    </a>
                    <span className="text-[10px] text-[#138808] font-semibold block mt-0.5">
                      Toll-Free 24/7
                    </span>
                  </div>
                </div>

                {/* Plan Ahead Tip Box */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2.5">
                  <Sprout className="w-4 h-4 text-[#138808] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-950 block font-bold">
                      {t('stats.planTipTitle')}
                    </strong>
                    <span className="text-[11px] text-emerald-800">
                      {t('stats.planTipDesc')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. SERVICES AT A GLANCE (3x2 Grid of Key Modules) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-[#FF9933] rounded-full" />
            <span className="text-xs font-bold tracking-widest text-[#FF9933] uppercase">
              {t('services.sectionTitle')}
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1 tracking-tight">
            {t('services.heading')}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Find a Centre */}
          <div
            id="service-card-find-centre"
            onClick={() => onNavigate('centres')}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MapPin className="w-5 h-5 text-[#138808]" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.findCentreTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.findCentreDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.findCentreLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 2: Book a Procurement Slot */}
          <div
            id="service-card-book-slot"
            onClick={onBookNow}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CalendarDays className="w-5 h-5 text-[#FF9933]" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.bookSlotTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.bookSlotDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.bookSlotLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 3: Track Your Booking */}
          <div
            id="service-card-track-booking"
            onClick={() => onNavigate('track')}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Ticket className="w-5 h-5 text-[#16233B]" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.trackBookingTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.trackBookingDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.trackBookingLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 4: Raise a Complaint */}
          <div
            id="service-card-raise-complaint"
            onClick={() => onNavigate('support')}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <LifeBuoy className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.complaintTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.complaintDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.complaintLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 5: Customer Support */}
          <div
            id="service-card-support"
            onClick={() => onNavigate('support')}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Headphones className="w-5 h-5 text-[#16233B]" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.supportTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.supportDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.supportLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>

          {/* Card 6: Kisan Sahayak */}
          <div
            id="service-card-sahayak"
            onClick={() => onNavigate('support')}
            className="p-6 rounded-xl bg-white border border-[#D7DEE7] hover:border-[#16233B] shadow-xs hover:shadow-md transition duration-150 cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="w-11 h-11 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7] text-[#16233B] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#FF9933]" />
              </div>
              <h3 className="font-bold text-base text-[#172033] group-hover:text-[#16233B] transition">
                {t('services.sahayakTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-[#64748B] mt-1.5 leading-relaxed">
                {t('services.sahayakDesc')}
              </p>
            </div>
            <div className="pt-4 mt-4 border-t border-stone-100 flex items-center text-xs font-bold text-[#16233B] group-hover:text-[#FF9933] transition">
              <span>{t('services.sahayakLink')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. LATEST NOTICES & CIRCULARS */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl border border-[#D7DEE7] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF9933]" />
              <h3 className="font-bold text-base text-[#172033]">
                {language === 'hi' ? 'नवीनतम सूचनाएं एवं परिपत्र' : 'Latest Notices & Circulars'}
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#64748B]">
              {language === 'hi' ? 'डिजिटल कृषि मिशन' : 'Digital Agriculture Platform'}
            </span>
          </div>

          <div className="space-y-3">
            {announcements.slice(0, 3).map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-lg bg-[#F3F6FA] border border-[#D7DEE7]/70 hover:border-[#16233B] transition flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 uppercase tracking-wide">
                      {ann.category}
                    </span>
                    <span className="text-xs text-[#64748B] font-mono">
                      {new Date(ann.publishedAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-stone-900">
                    {language === 'hi' ? ann.titleHi || ann.title : ann.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate('support')}
                  className="text-xs font-bold text-[#16233B] hover:text-[#FF9933] flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>{language === 'hi' ? 'विवरण पढ़ें' : 'Read Notice'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. HOW IT WORKS (Institutional Process Flow) */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-1 bg-[#138808] rounded-full" />
            <span className="text-xs font-bold tracking-widest text-[#138808] uppercase">
              {language === 'hi' ? 'सरल व पारदर्शी प्रक्रिया' : 'Transparent Workflow'}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#172033] mt-1 tracking-tight">
            {t('howItWorks.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-2">
            <div className="w-7 h-7 rounded-md bg-[#16233B] text-white font-bold flex items-center justify-center text-xs font-mono">
              1
            </div>
            <h4 className="font-bold text-sm text-stone-900">{t('howItWorks.step1Title')}</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">{t('howItWorks.step1Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-2">
            <div className="w-7 h-7 rounded-md bg-[#16233B] text-white font-bold flex items-center justify-center text-xs font-mono">
              2
            </div>
            <h4 className="font-bold text-sm text-stone-900">{t('howItWorks.step2Title')}</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">{t('howItWorks.step2Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-2">
            <div className="w-7 h-7 rounded-md bg-[#16233B] text-white font-bold flex items-center justify-center text-xs font-mono">
              3
            </div>
            <h4 className="font-bold text-sm text-stone-900">{t('howItWorks.step3Title')}</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">{t('howItWorks.step3Desc')}</p>
          </div>

          <div className="p-5 rounded-xl bg-white border border-[#D7DEE7] space-y-2">
            <div className="w-7 h-7 rounded-md bg-[#16233B] text-white font-bold flex items-center justify-center text-xs font-mono">
              4
            </div>
            <h4 className="font-bold text-sm text-stone-900">{t('howItWorks.step5Title')}</h4>
            <p className="text-xs text-[#64748B] leading-relaxed">{t('howItWorks.step5Desc')}</p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. ABOUT PARADOX AGRIPROCURE TEASER */}
      {/* ========================================================================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#D7DEE7] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
          <div className="space-y-2 max-w-2xl">
            <span className="text-[11px] font-bold text-[#16233B] uppercase tracking-wider">
              {language === 'hi' ? 'प्लेटफॉर्म के बारे में' : 'About the Platform'}
            </span>
            <h3 className="text-xl font-bold text-[#172033]">
              {language === 'hi' ? 'पैराडॉक्स एग्रीप्रोक्योर क्या है?' : 'What is PARADOX AgriProcure?'}
            </h3>
            <p className="text-xs sm:text-sm text-[#64748B] leading-relaxed">
              {language === 'hi'
                ? 'यह एक स्वतंत्र, किसान-हितैषी डिजिटल सेवा मंच है जो भारत भर के 36 राज्यों व केंद्र शासित प्रदेशों में मंडियों की क्षमता, स्लॉट बुकिंग और वास्तविक समय कतार ट्रैकिंग को सुलभ बनाता है।'
                : 'An independent farmer-first digital services platform enabling seamless mandi capacity discovery, slot reservations, and real-time weighbridge queue tracking across India.'}
            </p>
          </div>

          <button
            type="button"
            id="home-read-about-btn"
            onClick={() => onNavigate('about')}
            className="px-5 py-2.5 bg-[#16233B] hover:bg-[#0B1730] text-white font-bold text-xs sm:text-sm rounded-lg shrink-0 flex items-center gap-2 transition cursor-pointer"
          >
            <span>{language === 'hi' ? 'विस्तृत जानकारी पढ़ें' : 'Explore About & Mission'}</span>
            <ArrowRight className="w-4 h-4 text-[#FF9933]" />
          </button>
        </div>
      </section>
    </div>
  );
};
