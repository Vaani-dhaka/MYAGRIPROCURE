import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext.js';
import { AccessibilityProvider } from './context/AccessibilityContext.js';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { Header } from './components/Header.js';
import { NoticeTicker } from './components/NoticeTicker.js';
import { Footer } from './components/Footer.js';
import { BookingModal } from './components/BookingModal.js';
import { KisanSahayak } from './components/KisanSahayak.js';
import { AuthModal } from './components/AuthModal.js';
import { AccessRestricted } from './components/AccessRestricted.js';

import { HomeView } from './views/HomeView.js';
import { AboutView } from './views/AboutView.js';
import { CentresView } from './views/CentresView.js';
import { TrackBookingView } from './views/TrackBookingView.js';
import { SupportView } from './views/SupportView.js';
import { FarmerPortalView } from './views/FarmerPortalView.js';
import { StaffPortalView } from "./views/StaffPortalView";
import { AdminPortalView } from './views/AdminPortalView.js';

import { Centre, Booking, PlatformStats, UserRole } from './types/index.js';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('home');
  const [stats, setStats] = useState<PlatformStats | null>(null);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [selectedCentreForBooking, setSelectedCentreForBooking] = useState<Centre | null>(null);
  const [defaultCentres, setDefaultCentres] = useState<Centre[]>([]);

  // Auth Modal State
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialRole, setAuthModalInitialRole] = useState<UserRole>('FARMER');

  // Tracking Token state
  const [trackTokenToView, setTrackTokenToView] = useState<string>('PX-001');

  // Fetch initial stats and centres
  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error('Error fetching stats:', err));

    fetch('/api/centres')
      .then((res) => res.json())
      .then((data: Centre[]) => {
        setDefaultCentres(data);
      })
      .catch((err) => console.error('Error fetching centres:', err));
  }, []);

  const handleOpenBookingModal = (centre?: Centre) => {
    // Booking is a farmer-only action. Staff/Admin are redirected to their own desk.
    if (!user) {
      handleOpenAuthModal('FARMER');
      return;
    }
    if (user.role !== 'FARMER') {
      setActiveTab(user.role === 'STAFF' ? 'staff' : 'admin');
      return;
    }

    if (centre) {
      setSelectedCentreForBooking(centre);
    } else {
      const locationMatch = defaultCentres.find(
        (c) => c.state.toLowerCase() === (user.state || '').toLowerCase() &&
               c.district.toLowerCase() === (user.district || '').toLowerCase()
      );
      setSelectedCentreForBooking(locationMatch || defaultCentres[0] || null);
    }
    setBookingModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setTrackTokenToView(booking.bookingToken);
    // Refresh stats
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() => {});
  };

  const handleNavigateToTrack = (token: string) => {
    setTrackTokenToView(token);
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAuthModal = (role: UserRole = 'FARMER') => {
    setAuthModalInitialRole(role);
    setAuthModalOpen(true);
  };

  // Role Authorization Check
  const canAccessStaff = user?.role === 'STAFF';
  const canAccessAdmin = user?.role === 'ADMIN';

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F6FA] text-[#172033] selection:bg-[#FF9933] selection:text-white">
      {/* 1. Header with 3 levels and Navy Navigation Bar */}
      <Header
        activeTab={activeTab}
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onBookNow={() => handleOpenBookingModal()}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* 2. Urgent / High Priority Notice Ticker */}
      <NoticeTicker />

      {/* 3. Main Dynamic Content Views */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            stats={stats}
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookNow={() => handleOpenBookingModal()}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            onNavigate={(tab) => {
              setActiveTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onBookNow={() => handleOpenBookingModal()}
          />
        )}

        {activeTab === 'centres' && (
          <CentresView
            onSelectCentreForBooking={(centre) => handleOpenBookingModal(centre)}
          />
        )}

        {activeTab === 'track' && (
          <TrackBookingView initialToken={trackTokenToView} />
        )}

        {activeTab === 'support' && <SupportView />}

        {activeTab === 'farmer' && (
          <FarmerPortalView
            onBookNewSlot={() => handleOpenBookingModal()}
            onTrackToken={handleNavigateToTrack}
          />
        )}

        {/* Staff Dashboard with Strict Role Security */}
        {activeTab === 'staff' && (
          canAccessStaff ? (
            <StaffPortalView />
          ) : (
            <AccessRestricted
              requiredRole="STAFF"
              onOpenLogin={(role) => handleOpenAuthModal(role)}
              onGoHome={() => setActiveTab('home')}
            />
          )
        )}

        {/* Admin Portal with Strict Role Security */}
        {activeTab === 'admin' && (
          canAccessAdmin ? (
            <AdminPortalView />
          ) : (
            <AccessRestricted
              requiredRole="ADMIN"
              onOpenLogin={(role) => handleOpenAuthModal(role)}
              onGoHome={() => setActiveTab('home')}
            />
          )
        )}
      </main>

      {/* 4. Slot Booking Modal */}
      {bookingModalOpen && (
        <BookingModal
          centre={selectedCentreForBooking}
          onClose={() => setBookingModalOpen(false)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* 5. Role Authentication & Login Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialRole={authModalInitialRole}
        onSuccess={(authenticatedRole) => {
          if (authenticatedRole === 'ADMIN') {
            setActiveTab('admin');
          } else if (authenticatedRole === 'STAFF') {
            setActiveTab('staff');
          } else {
            setActiveTab('farmer');
          }
        }}
      />

      {/* 6. Static Kisan Sahayak help assistant */}
      <KisanSahayak />

      {/* 7. Institutional Footer */}
      <Footer
        onNavigate={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <AuthProvider>
          <MainAppContent />
        </AuthProvider>
      </AccessibilityProvider>
    </LanguageProvider>
  );
};

export default App;
