import React, { useState } from 'react';
import {
  PhoneCall,
  Eye,
  Globe,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  ChevronDown,
  Building2,
  HelpCircle,
  Home,
  MapPin,
  Ticket,
  Info,
  LayoutDashboard,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAccessibility } from '../context/AccessibilityContext';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/index';

interface HeaderProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onBookNow: () => void;
  onOpenAuthModal: (role?: UserRole) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onNavigate,
  onBookNow,
  onOpenAuthModal,
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { fontScale, setFontScale, highContrast, toggleHighContrast } = useAccessibility();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleDashboardClick = () => {
    if (!user) {
      onOpenAuthModal('FARMER');
      return;
    }
    if (user.role === 'STAFF') {
      onNavigate('staff');
    } else if (user.role === 'ADMIN') {
      onNavigate('admin');
    } else {
      onNavigate('farmer');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full shadow-md bg-white">
      {/* ========================================================================= */}
      {/* LEVEL 1: DARK NAVY (#0B1730) INFORMATION BAR */}
      {/* ========================================================================= */}
      <div className="bg-[#0B1730] text-stone-200 text-xs py-1 px-4 sm:px-6 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
          {/* Left Info Links */}
          <div className="flex items-center space-x-3 flex-wrap text-[11px] sm:text-xs">
            <span className="font-semibold text-amber-400 tracking-wide flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#138808] animate-pulse" />
              {t('topBar.portalTitle')}
            </span>

            <span className="hidden md:inline-block text-stone-600">|</span>

            <a
              href="tel:18001801551"
              className="hidden sm:flex items-center gap-1 text-stone-300 hover:text-white transition"
              title="Kisan Call Centre 24/7 Helpline"
            >
              <PhoneCall className="w-3.5 h-3.5 text-[#FF9933]" />
              <span className="font-mono">{t('topBar.tollFree')}</span>
            </a>

            <span className="hidden lg:inline-block text-stone-600">|</span>

            <span className="hidden lg:inline-block text-stone-400">
              {t('topBar.mission')}
            </span>

            <span className="hidden xl:inline-block text-stone-600">|</span>

            <span className="hidden xl:inline-block text-stone-400">
              {t('topBar.grievance')}
            </span>
          </div>

          {/* Right Accessibility & Language Controls */}
          <div className="flex items-center space-x-2.5 ml-auto">
            {/* Font scaling controls */}
            <div className="hidden sm:flex items-center bg-[#16233B] rounded px-1.5 py-0.5 border border-stone-700 space-x-1">
              <button
                type="button"
                id="font-scale-sm-btn"
                onClick={() => setFontScale('sm')}
                className={`px-1.5 py-0.5 rounded text-[11px] transition ${
                  fontScale === 'sm'
                    ? 'bg-[#FF9933] text-stone-950 font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Small text"
              >
                A-
              </button>
              <button
                type="button"
                id="font-scale-md-btn"
                onClick={() => setFontScale('md')}
                className={`px-1.5 py-0.5 rounded text-[11px] transition ${
                  fontScale === 'md'
                    ? 'bg-[#FF9933] text-stone-950 font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Normal text"
              >
                A
              </button>
              <button
                type="button"
                id="font-scale-lg-btn"
                onClick={() => setFontScale('lg')}
                className={`px-1.5 py-0.5 rounded text-[11px] transition ${
                  fontScale === 'lg'
                    ? 'bg-[#FF9933] text-stone-950 font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="Large text"
              >
                A+
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              type="button"
              id="high-contrast-toggle-btn"
              onClick={toggleHighContrast}
              className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition ${
                highContrast
                  ? 'bg-[#FF9933] text-stone-950 border-amber-400 font-bold'
                  : 'bg-[#16233B] text-stone-300 border-stone-700 hover:text-white'
              }`}
              title="Toggle High Contrast Mode"
            >
              <Eye className="w-3 h-3" />
              <span>{t('header.contrast')}</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-[#16233B] rounded border border-stone-700 overflow-hidden text-[11px]">
              <button
                type="button"
                id="lang-en-btn"
                onClick={() => setLanguage('en')}
                className={`px-2 py-0.5 transition flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-[#138808] text-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                id="lang-hi-btn"
                onClick={() => setLanguage('hi')}
                className={`px-2 py-0.5 transition flex items-center gap-1 ${
                  language === 'hi'
                    ? 'bg-[#138808] text-white font-bold'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 2: THIN TRICOLOUR LINE */}
      {/* ========================================================================= */}
      <div className="w-full flex">
        <div className="flex-1 h-[2.5px] bg-[#FF9933]" />
        <div className="flex-1 h-[2.5px] bg-[#FFFFFF]" />
        <div className="flex-1 h-[2.5px] bg-[#138808]" />
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 3: WHITE IDENTITY HEADER */}
      {/* ========================================================================= */}
      <div className="bg-white border-b border-[#D7DEE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Left: Exact Logo & Identity Stack */}
          <div
            className="flex items-center space-x-3.5 cursor-pointer select-none"
            onClick={() => onNavigate('home')}
          >
            <img
              src="/logo.png"
              alt="PARADOX AgriProcure Emblem"
              className="h-14 sm:h-16 w-auto object-contain shrink-0 drop-shadow-xs"
            />
            <div className="space-y-0.5">
              <div className="text-[10px] sm:text-[11px] font-bold text-[#16233B] tracking-wider uppercase flex items-center gap-1.5">
                <span>{t('header.subBrand') || 'PARADOX AGRIPROCURE • FARMER-FIRST DIGITAL SERVICES'}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-[#16233B] tracking-tight leading-none">
                PARADOX <span className="text-[#FF9933]">AgriProcure</span>
              </h1>
              <p className="text-xs sm:text-sm font-semibold text-[#172033] leading-tight">
                {t('header.tagline')}
              </p>
              <p className="hidden md:block text-[11px] text-[#64748B] leading-tight">
                {t('header.servicesDesc')}
              </p>
            </div>
          </div>

          {/* Right: Authenticated User Profile or Sign-in Action */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  id="user-profile-menu-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 sm:px-3 sm:py-2 rounded-lg border border-[#D7DEE7] hover:border-[#16233B] bg-[#F3F6FA] text-left transition cursor-pointer"
                >
                  {/* Avatar Circle */}
                  <div className="w-9 h-9 rounded-full bg-[#16233B] text-white font-bold flex items-center justify-center text-sm shadow-xs border border-[#233554]">
                    {user.name.charAt(0)}
                  </div>

                  {/* Name and Role text */}
                  <div className="hidden sm:block text-left pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#172033] leading-tight truncate max-w-[150px]">
                        {user.name}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#138808] shrink-0" />
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-[#64748B] font-medium truncate max-w-[120px]">
                        {user.role === 'FARMER'
                          ? user.farmerCategory || user.farmerId || 'Farmer'
                          : user.role === 'STAFF'
                          ? 'Karnal Mandi Staff'
                          : 'Portal Administrator'}
                      </span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                          user.role === 'FARMER'
                            ? 'bg-emerald-100 text-emerald-800'
                            : user.role === 'STAFF'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-slate-200 text-slate-800'
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>

                  <ChevronDown className="w-4 h-4 text-stone-400 hidden sm:block" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    id="user-profile-dropdown"
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-[#D7DEE7] py-2 z-50 animate-in fade-in duration-150"
                  >
                    <div className="px-4 py-2 border-b border-stone-100 sm:hidden">
                      <p className="text-xs font-bold text-stone-900">{user.name}</p>
                      <p className="text-[10px] text-stone-500">{user.role}</p>
                    </div>

                    <button
                      type="button"
                      id="dropdown-go-dashboard-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleDashboardClick();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#F3F6FA] hover:text-[#16233B] flex items-center gap-2 cursor-pointer"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-[#16233B]" />
                      <span>
                        {user.role === 'ADMIN'
                          ? (language === 'hi' ? 'प्रशासक डेस्क (Admin Desk)' : 'Admin Desk (Central Board)')
                          : user.role === 'STAFF'
                          ? (language === 'hi' ? 'स्टाफ डेस्क (Staff Desk)' : 'Staff Desk (Mandi)')
                          : (language === 'hi' ? 'किसान पोर्टल (मेरी बुकिंग)' : 'Farmer Portal (My Bookings)')}
                      </span>
                    </button>

                    <button
                      type="button"
                      id="dropdown-switch-role-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenAuthModal();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-[#F3F6FA] hover:text-[#16233B] flex items-center gap-2 cursor-pointer"
                    >
                      <UserCheck className="w-3.5 h-3.5 text-[#FF9933]" />
                      <span>{language === 'hi' ? 'खाता बदलें / स्विच करें' : 'Switch Account / Role'}</span>
                    </button>

                    <div className="border-t border-stone-100 my-1" />

                    <button
                      type="button"
                      id="dropdown-logout-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('header.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                id="header-login-btn"
                onClick={() => onOpenAuthModal('FARMER')}
                className="flex items-center gap-2 px-4 py-2 bg-[#16233B] hover:bg-[#0B1730] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition cursor-pointer"
              >
                <User className="w-4 h-4 text-[#FF9933]" />
                <span>{t('header.login')}</span>
              </button>
            )}

            {/* Mobile Hamburger Menu button */}
            <button
              type="button"
              id="mobile-nav-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-md border border-[#D7DEE7] text-stone-700 hover:bg-stone-100 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEVEL 4: DARK NAVY (#16233B) NAVIGATION BAR */}
      {/* ========================================================================= */}
      <nav className="bg-[#16233B] text-white border-b border-[#0B1730]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="hidden lg:flex items-center justify-between">
            {/* Nav links */}
            <div className="flex items-center space-x-1">
              {/* Home */}
              <button
                type="button"
                id="nav-home"
                onClick={() => onNavigate('home')}
                className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'home'
                    ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                    : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t('nav.home')}</span>
              </button>

              {/* Centres & Booking */}
              <button
                type="button"
                id="nav-centres"
                onClick={() => onNavigate('centres')}
                className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'centres'
                    ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                    : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>{t('nav.centres')}</span>
              </button>

              {/* Track Booking */}
              <button
                type="button"
                id="nav-track"
                onClick={() => onNavigate('track')}
                className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'track'
                    ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                    : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                }`}
              >
                <Ticket className="w-4 h-4" />
                <span>{t('nav.track')}</span>
              </button>

              {/* Support */}
              <button
                type="button"
                id="nav-support"
                onClick={() => onNavigate('support')}
                className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'support'
                    ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                    : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>{t('nav.support')}</span>
              </button>

              {/* About */}
              <button
                type="button"
                id="nav-about"
                onClick={() => onNavigate('about')}
                className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                  activeTab === 'about'
                    ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                    : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>{t('nav.about')}</span>
              </button>

              {/* Role-Specific Portal Nav Tabs (Direct & Clear) */}
              {user?.role === 'ADMIN' && (
                <button
                  type="button"
                  id="nav-admin"
                  onClick={() => onNavigate('admin')}
                  className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                    activeTab === 'admin'
                      ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                      : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-[#FF9933]" />
                  <span>{language === 'hi' ? 'प्रशासक डेस्क' : 'Admin Desk'}</span>
                </button>
              )}

              {user?.role === 'STAFF' && (
                <button
                  type="button"
                  id="nav-staff"
                  onClick={() => onNavigate('staff')}
                  className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                    activeTab === 'staff'
                      ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                      : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-[#FF9933]" />
                  <span>{language === 'hi' ? 'स्टाफ डेस्क' : 'Staff Desk'}</span>
                </button>
              )}

              {user?.role === 'FARMER' && (
                <button
                  type="button"
                  id="nav-farmer"
                  onClick={() => onNavigate('farmer')}
                  className={`px-4 py-3 text-sm font-semibold transition flex items-center gap-1.5 border-b-2 ${
                    activeTab === 'farmer'
                      ? 'border-[#FF9933] text-[#FF9933] bg-[#0B1730]'
                      : 'border-transparent text-stone-100 hover:text-white hover:bg-[#203254]'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-[#FF9933]" />
                  <span>{language === 'hi' ? 'किसान डेस्क (मेरी बुकिंग)' : 'Farmer Desk (My Bookings)'}</span>
                </button>
              )}
            </div>

            {/* Right: Account / Role Portal Button */}
            <div className="flex items-center space-x-2 py-1.5">
              <button
                type="button"
                id="nav-account-dashboard-btn"
                onClick={handleDashboardClick}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-md transition flex items-center gap-1.5 ${
                  activeTab === 'farmer' || activeTab === 'staff' || activeTab === 'admin'
                    ? 'bg-[#FF9933] text-stone-950 shadow-sm'
                    : 'bg-[#0B1730] hover:bg-[#203254] text-stone-200 border border-stone-700'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#FF9933]" />
                <span>
                  {user?.role === 'STAFF'
                    ? (language === 'hi' ? 'स्टाफ डेस्क' : 'Staff Desk')
                    : user?.role === 'ADMIN'
                    ? (language === 'hi' ? 'प्रशासक डेस्क' : 'Admin Desk')
                    : user
                    ? (language === 'hi' ? 'किसान डेस्क (मेरी बुकिंग)' : 'Farmer Desk (My Bookings)')
                    : (language === 'hi' ? 'लॉगिन / पंजीकरण' : 'Login / Register')}
                </span>
                <ArrowRight className="w-3 h-3 text-current" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div
            id="mobile-nav-menu"
            className="lg:hidden bg-[#0B1730] border-t border-stone-800 px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150"
          >
            <button
              type="button"
              onClick={() => {
                onNavigate('home');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'home' ? 'bg-[#16233B] text-[#FF9933]' : 'text-stone-200'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('centres');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'centres' ? 'bg-[#16233B] text-[#FF9933]' : 'text-stone-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>{t('nav.centres')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('track');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'track' ? 'bg-[#16233B] text-[#FF9933]' : 'text-stone-200'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>{t('nav.track')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('support');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'support' ? 'bg-[#16233B] text-[#FF9933]' : 'text-stone-200'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>{t('nav.support')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onNavigate('about');
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-3 py-2 rounded text-sm font-semibold flex items-center gap-2 ${
                activeTab === 'about' ? 'bg-[#16233B] text-[#FF9933]' : 'text-stone-200'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>{t('nav.about')}</span>
            </button>

            <div className="pt-2 border-t border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleDashboardClick();
                }}
                className="w-full py-2 px-3 bg-[#FF9933] text-stone-950 font-bold rounded text-xs flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>
                  {user?.role === 'STAFF'
                    ? (language === 'hi' ? 'स्टाफ डेस्क' : 'Staff Desk')
                    : user?.role === 'ADMIN'
                    ? (language === 'hi' ? 'प्रशासक डेस्क' : 'Admin Desk')
                    : user
                    ? (language === 'hi' ? 'किसान डेस्क (मेरी बुकिंग)' : 'Farmer Desk (My Bookings)')
                    : (language === 'hi' ? 'लॉगिन / पंजीकरण' : 'Login / Register')}
                </span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
