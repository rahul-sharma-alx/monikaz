import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Service, Staff, Booking, Review, Notification, BookingStatus, SupabaseConfig, Profile, Shop, Address, SocialMedia } from './types';
import { api } from './services/api';
import { getSupabaseCredentials, saveSupabaseCredentials, setupAuthListener, onAuthChange, getSupabaseClient, signOut } from './lib/supabase';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PinnedJourney } from './components/PinnedJourney';
import { ServiceCatalog } from './components/ServiceCatalog';
import { TransformationReveal } from './components/TransformationReveal';
import { StaffCatalog } from './components/StaffCatalog';
import { BookingFlowModal } from './components/BookingFlowModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ReviewModal } from './components/ReviewModal';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';
import { SmoothScroll } from './components/SmoothScroll';
import { AuthModal } from './components/AuthModal';

export default function App() {
  // Auth & Profile State
  const [currentUser, setCurrentUser] = useState<Profile | null>(() => {
    const saved = localStorage.getItem('monikaz_user');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    // Default logged in user for instant preview
    return {
      id: 'user-c1',
      full_name: 'Sophia Williams',
      phone: '+91 98765 43210',
      email: 'sophia.w@example.com',
      role: 'customer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString()
    };
  });

  const [currentRole, setCurrentRole] = useState<UserRole>(() => currentUser?.role || 'customer');
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'bookings' | 'admin'>('services');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [requiredRoleForAdmin, setRequiredRoleForAdmin] = useState<boolean>(false);

  // Main Data Collections
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  // UI Filters & Query State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Flow State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedStaff, setPreselectedStaff] = useState<Staff | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // QR booking flow
  const [pendingBookingAfterAuth, setPendingBookingAfterAuth] = useState(false);

  // Realtime & Notifications
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);

  // Supabase Credentials
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(() => {
    const creds = getSupabaseCredentials();
    return {
      url: creds.url,
      anonKey: creds.anonKey,
      isConnected: !!(creds.url && creds.anonKey)
    };
  });

  // Shop data
  const [shop, setShop] = useState<Shop | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const [sData, stData, bData, rData, eData, shopData] = await Promise.all([
        api.getServices(),
        api.getStaff(),
        api.getBookings(currentUser),
        api.getReviews(currentUser),
        api.getEmailLogs().catch(() => []),
        api.getShop().catch(() => null)
      ]);

      setServices(sData);
      setStaffList(stData);
      setBookings(bData);
      setReviews(rData);
      setEmailLogs(eData);
      if (shopData) {
        setShop(shopData.shop);
        setAddresses(shopData.addresses);
        setSocialMedia(shopData.social_media);
      }
    } catch (err) {
      console.error('Failed to load initial parlour data:', err);
    }
  }, [currentUser]);

  // Handle ?book=true QR scan flow
  useEffect(() => {
    if (window.location.search.includes('book=true')) {
      if (currentUser) {
        setPendingBookingAfterAuth(false);
        setPreselectedService(null);
        setPreselectedStaff(null);
        setIsBookingModalOpen(true);
      } else {
        setPendingBookingAfterAuth(true);
        setIsAuthModalOpen(true);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Subscribe to Realtime Updates (SSE / Supabase)
  useEffect(() => {
    const unsubscribe = api.subscribeRealtime((event, payload) => {
      if (event === 'booking_created') {
        setBookings(prev => [payload, ...prev.filter(b => b.id !== payload.id)]);
        addNotification({
          id: `notif-${Date.now()}`,
          title: 'New Booking Reserved',
          message: `${payload.customer_name} reserved "${payload.service_name}" for ${payload.booking_date} at ${payload.start_time}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'booking_status'
        });
      } else if (event === 'booking_status_changed' || event === 'booking_updated') {
        setBookings(prev => prev.map(b => (b.id === payload.id ? payload : b)));
        addNotification({
          id: `notif-${Date.now()}`,
          title: 'Appointment Status Update',
          message: `Booking #${payload.id} (${payload.service_name}) is now ${payload.status.toUpperCase().replace('_', ' ')}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'booking_status'
        });
      } else if (event === 'review_added') {
        setReviews(prev => [payload, ...prev.filter(r => r.id !== payload.id)]);
        addNotification({
          id: `notif-${Date.now()}`,
          title: 'New Salon Review',
          message: `${payload.customer_name} left a ${payload.rating}★ rating for ${payload.service_name}`,
          timestamp: new Date().toISOString(),
          read: false,
          type: 'system'
        });
      } else if (event === 'service_updated') {
        loadData();
      }
    });

    return () => unsubscribe();
  }, [loadData]);

  // Supabase auth state listener (Google OAuth)
  useEffect(() => {
    setupAuthListener();
    const unsub = onAuthChange(async (user) => {
      if (user) {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        const { data: existing, error: fetchErr } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
        if (existing) {
          const p: Profile = { id: existing.id, full_name: existing.full_name, phone: existing.phone || '', email: existing.email, role: existing.role, avatar_url: existing.avatar_url, created_at: existing.created_at };
          setCurrentUser(p); setCurrentRole(p.role);
          localStorage.setItem('monikaz_user', JSON.stringify(p));
        } else {
          const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          const newProfile = {
            id: user.id, full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone: '', email: user.email || '', role: 'customer' as UserRole,
            avatar_url,
          };
          const { error } = await supabase.from('profiles').insert([{ ...newProfile, created_at: new Date().toISOString() }]);
          if (!error) {
            setCurrentUser(newProfile as Profile); setCurrentRole('customer');
            localStorage.setItem('monikaz_user', JSON.stringify(newProfile));
          }
        }
      }
    });
    return () => unsub();
  }, []);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
  };

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Actions
  const handleOpenBookingForService = (service: Service) => {
    setPreselectedService(service);
    setPreselectedStaff(null);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingWithStaff = (staff: Staff) => {
    setPreselectedStaff(staff);
    setPreselectedService(services.length > 0 ? services[0] : null);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmitted = async (bookingData: Partial<Booking>) => {
    const created = await api.createBooking(bookingData);
    setBookings(prev => [created, ...prev]);
    const updatedLogs = await api.getEmailLogs().catch(() => []);
    setEmailLogs(updatedLogs);

    addNotification({
      id: `notif-${Date.now()}`,
      title: 'Booking Confirmed!',
      message: `Your appointment for ${created.service_name} on ${created.booking_date} at ${created.start_time} is reserved.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'booking_status'
    });
  };

  const handleCancelBooking = async (bookingId: string) => {
    const updated = await api.updateBookingStatus(bookingId, 'cancelled');
    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
  };

  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    const updated = await api.updateBookingStatus(bookingId, status);
    setBookings(prev => prev.map(b => b.id === bookingId ? updated : b));
  };

  const handleCreateService = async (srvData: Partial<Service>) => {
    try {
      const created = await api.createService(srvData);
      setServices(prev => [created, ...prev]);
    } catch (err: any) {
      addNotification({ id: `err-${Date.now()}`, title: 'Failed to create service', message: err?.message || 'Unknown error', timestamp: new Date().toISOString(), read: false, type: 'system' });
    }
  };

  const handleUpdateService = async (id: string, srvData: Partial<Service>) => {
    try {
      const updated = await api.updateService(id, srvData);
      setServices(prev => prev.map(s => s.id === id ? updated : s));
    } catch (err: any) {
      addNotification({ id: `err-${Date.now()}`, title: 'Failed to update service', message: err?.message || 'Unknown error', timestamp: new Date().toISOString(), read: false, type: 'system' });
    }
  };

  const handleCreateStaff = async (stfData: Partial<Staff>) => {
    try {
      const created = await api.createStaff(stfData);
      setStaffList(prev => [...prev, created]);
    } catch (err: any) {
      addNotification({ id: `err-${Date.now()}`, title: 'Failed to create staff', message: err?.message || 'Unknown error', timestamp: new Date().toISOString(), read: false, type: 'system' });
    }
  };

  const handleUpdateStaff = async (id: string, stfData: Partial<Staff>) => {
    try {
      const updated = await api.updateStaff(id, stfData);
      setStaffList(prev => prev.map(st => st.id === id ? updated : st));
    } catch (err: any) {
      addNotification({ id: `err-${Date.now()}`, title: 'Failed to update staff', message: err?.message || 'Unknown error', timestamp: new Date().toISOString(), read: false, type: 'system' });
    }
  };

  const handleOpenReviewModal = (booking: Booking) => {
    setReviewBooking(booking);
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = async (bookingId: string, rating: number, comment: string) => {
    if (!reviewBooking) return;
    const rev = await api.createReview({
      booking_id: bookingId,
      customer_id: reviewBooking.customer_id,
      customer_name: reviewBooking.customer_name,
      service_id: reviewBooking.service_id,
      service_name: reviewBooking.service_name,
      staff_id: reviewBooking.staff_id,
      staff_name: reviewBooking.staff_name,
      rating,
      comment
    });
    setReviews(prev => [rev, ...prev]);
  };

  const handleRespondToReview = async (reviewId: string, response: string) => {
    const updated = await api.respondToReview(reviewId, response);
    setReviews(prev => prev.map(r => r.id === reviewId ? updated : r));
  };

  // Shop Handlers
  const handleUpdateShop = async (data: { name?: string; logo_url?: string }) => {
    const updated = await api.updateShop(data);
    setShop(prev => prev ? { ...prev, ...updated } : updated);
  };

  const handleAddAddress = async (address: string) => {
    const addr = await api.addAddress(address);
    setAddresses(prev => [...prev, addr]);
  };

  const handleDeleteAddress = async (id: string) => {
    await api.deleteAddress(id);
    setAddresses(prev => prev.filter(a => a.id !== id));
  };

  const handleAddSocialMedia = async (media_name: string, link: string) => {
    const sm = await api.addSocialMedia(media_name, link);
    setSocialMedia(prev => [...prev, sm]);
  };

  const handleDeleteSocialMedia = async (id: string) => {
    await api.deleteSocialMedia(id);
    setSocialMedia(prev => prev.filter(s => s.id !== id));
  };

  // Auth Handlers
  const handleLogin = (profile: Profile) => {
    setCurrentUser(profile);
    setCurrentRole(profile.role);
    localStorage.setItem('monikaz_user', JSON.stringify(profile));
    setIsAuthModalOpen(false);
    setRequiredRoleForAdmin(false);
    if (pendingBookingAfterAuth) {
      setPendingBookingAfterAuth(false);
      setPreselectedService(null);
      setPreselectedStaff(null);
      setIsBookingModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    localStorage.removeItem('monikaz_user');
    signOut();
    if (activeTab === 'admin') {
      setActiveTab('services');
    }
    setIsAuthModalOpen(false);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin' && currentUser?.role !== 'admin') {
      setRequiredRoleForAdmin(true);
      setIsAuthModalOpen(true);
    }
  };

  const handleTabChange = (tab: 'services' | 'staff' | 'bookings' | 'admin') => {
    if (tab === 'admin') {
      if (currentRole !== 'admin' || currentUser?.role !== 'admin') {
        setCurrentRole('admin');
        setRequiredRoleForAdmin(true);
        setIsAuthModalOpen(true);
        return;
      }
    }
    setActiveTab(tab);
  };

  const handleSaveSupabaseCredentialsHandler = (url: string, key: string) => {
    saveSupabaseCredentials(url, key);
    setSupabaseConfig({
      url,
      anonKey: key,
      isConnected: !!(url && key)
    });
  };

  const unreadNotifCount = notifications.filter(n => !n.read).length;

  return (
    <SmoothScroll>
      <div className="min-h-screen bg-[#FAF6F3] text-[#2C221E] font-sans antialiased flex flex-col selection:bg-[#E8C5B8] selection:text-[#2C221E]">
        
        {/* Navigation Header */}
        <Header
          currentRole={currentRole}
          onRoleChange={handleRoleChange}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onOpenBooking={() => {
            setPreselectedService(services.length > 0 ? services[0] : null);
            setPreselectedStaff(null);
            setIsBookingModalOpen(true);
          }}
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => setActiveTab('bookings')}
          isConnected={isConnected}
          onOpenSupabaseModal={() => {
            handleTabChange('admin');
          }}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setRequiredRoleForAdmin(false);
            setIsAuthModalOpen(true);
          }}
          shop={shop}
        />

        {/* Main Content Render */}
        <main className="flex-1">
          {activeTab === 'services' && (
            <>
              <Hero
                onOpenBooking={() => {
                  setPreselectedService(services.length > 0 ? services[0] : null);
                  setPreselectedStaff(null);
                  setIsBookingModalOpen(true);
                }}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectCategory={setSelectedCategory}
              />

              {/* Pinned Scroll Storytelling Experience */}
              <PinnedJourney
                onOpenBooking={() => {
                  setPreselectedService(services.length > 0 ? services[0] : null);
                  setPreselectedStaff(null);
                  setIsBookingModalOpen(true);
                }}
              />

              <ServiceCatalog
                services={services}
                onBookService={handleOpenBookingForService}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Interactive Transformation Reveal Slider */}
              <TransformationReveal />
            </>
          )}

          {activeTab === 'staff' && (
            <StaffCatalog
              staffList={staffList}
              onBookWithStaff={handleOpenBookingWithStaff}
            />
          )}

          {activeTab === 'bookings' && (
            <CustomerDashboard
              bookings={bookings}
              reviews={reviews}
              onCancelBooking={handleCancelBooking}
              onOpenReviewModal={handleOpenReviewModal}
              emailLogs={emailLogs}
            />
          )}

          {activeTab === 'admin' && (
            <AdminDashboard
              currentUser={currentUser}
              services={services}
              staffList={staffList}
              bookings={bookings}
              reviews={reviews}
              onUpdateBookingStatus={handleUpdateBookingStatus}
              onCreateService={handleCreateService}
              onUpdateService={handleUpdateService}
              onCreateStaff={handleCreateStaff}
              onUpdateStaff={handleUpdateStaff}
              onRespondToReview={handleRespondToReview}
              supabaseConfig={supabaseConfig}
              onSaveSupabaseCredentials={handleSaveSupabaseCredentialsHandler}
              shop={shop}
              addresses={addresses}
              socialMedia={socialMedia}
              onUpdateShop={handleUpdateShop}
              onAddAddress={handleAddAddress}
              onDeleteAddress={handleDeleteAddress}
              onAddSocialMedia={handleAddSocialMedia}
              onDeleteSocialMedia={handleDeleteSocialMedia}
            />
          )}
        </main>

        {/* Footer */}
        <Footer shop={shop} addresses={addresses} socialMedia={socialMedia} />

        {/* Interactive Booking Wizard Modal */}
        <BookingFlowModal
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          services={services}
          staffList={staffList}
          existingBookings={bookings}
          preselectedService={preselectedService}
          preselectedStaff={preselectedStaff}
          onBookingSubmitted={handleBookingSubmitted}
        />

        {/* Review & Rating Modal */}
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          booking={reviewBooking}
          onSubmitReview={handleSubmitReview}
        />

        {/* Floating Realtime Notification Toast */}
        <NotificationToast
          notifications={notifications}
          onDismiss={handleDismissNotification}
        />

        {/* Auth & Login/Signup Modal */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onLogout={handleLogout}
          requiredRoleForAdmin={requiredRoleForAdmin}
        />

      </div>
    </SmoothScroll>
  );
}
