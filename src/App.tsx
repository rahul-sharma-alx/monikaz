import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Service, Staff, Booking, Review, Notification, BookingStatus, SupabaseConfig, Profile, Shop, Address, SocialMedia } from './types';
import { api } from './services/api';
import { getSupabaseCredentials, saveSupabaseCredentials, setupAuthListener, onAuthChange, getSupabaseClient, signOut, tryRecoverSessionFromHash, clearAuthHash } from './lib/supabase';
import { Phone, MapPin, MessageCircle, Sparkles, Scissors } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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
import { ProfileModal } from './components/ProfileModal';

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
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about'>(() => {
    const saved = sessionStorage.getItem('monikaz_activeTab');
    if (saved === 'services' || saved === 'staff' || saved === 'bookings' || saved === 'admin' || saved === 'contact' || saved === 'about') return saved;
    return 'services';
  });
  // Persist activeTab across reloads
  const handleSetActiveTab = (tab: 'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about') => {
    sessionStorage.setItem('monikaz_activeTab', tab);
    setActiveTab(tab);
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [requiredRoleForAdmin, setRequiredRoleForAdmin] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Main Data Collections
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI Filters & Query State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals & Flow State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState<boolean>(false);
  const [preselectedService, setPreselectedService] = useState<Service | null>(null);
  const [preselectedStaff, setPreselectedStaff] = useState<Staff | null>(null);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewBooking, setReviewBooking] = useState<Booking | null>(null);

  // Pending booking intent: saved when user triggers booking without auth
  const [pendingBookingIntent, setPendingBookingIntent] = useState<{
    service: Service | null;
    staff: Staff | null;
  } | null>(() => {
    const saved = localStorage.getItem('monikaz_pending_booking');
    if (saved) {
      try { return JSON.parse(saved); } catch { return null; }
    }
    return null;
  });

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
    setIsLoading(true);
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
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Handle ?book=true QR scan flow
  useEffect(() => {
    if (window.location.search.includes('book=true')) {
      if (currentUser) {
        setIsBookingModalOpen(true);
      } else {
        setPendingBookingIntent({ service: null, staff: null });
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
    // Direct URL hash recovery — handles OAuth redirect even if Supabase SDK's
    // _initialize() misses or delays processing the hash (common on slow/Vercel).
    const hashSession = tryRecoverSessionFromHash();
    if (hashSession) {
      const p: Profile = {
        id: hashSession.id, full_name: hashSession.full_name,
        phone: '', email: hashSession.email, role: 'customer',
        avatar_url: hashSession.avatar_url, created_at: new Date().toISOString(),
      };
      setCurrentUser(p); setCurrentRole('customer');
      localStorage.setItem('monikaz_user', JSON.stringify(p));
      clearAuthHash();
      const saved = localStorage.getItem('monikaz_pending_booking');
      if (saved) {
        try {
          const intent = JSON.parse(saved);
          localStorage.removeItem('monikaz_pending_booking');
          if (intent) { setPreselectedService(intent.service); setPreselectedStaff(intent.staff); setIsBookingModalOpen(true); }
        } catch {}
      }
      return;
    }

    setupAuthListener();
    const unsub = onAuthChange(async (user) => {
      if (user) {
        const supabase = getSupabaseClient();
        if (!supabase) return;
        try {
          const { data: existing } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
          if (existing) {
            const p: Profile = { id: existing.id, full_name: existing.full_name, phone: existing.phone || '', email: existing.email, role: existing.role, avatar_url: existing.avatar_url, created_at: existing.created_at };
            setCurrentUser(p); setCurrentRole(p.role);
            localStorage.setItem('monikaz_user', JSON.stringify(p));
          } else {
            throw null; // skip to upsert path
          }
        } catch {
          const avatar_url = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
          const newProfile = {
            id: user.id, full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
            phone: '', email: user.email || '', role: 'customer' as UserRole,
            avatar_url,
          };
          try {
            const { error: upsertErr } = await supabase!.from('profiles').upsert(
              { ...newProfile, created_at: new Date().toISOString() },
              { onConflict: 'id' }
            );
            if (upsertErr) console.warn('Could not save profile to Supabase:', upsertErr.message);
          } catch {}
          setCurrentUser(newProfile as Profile); setCurrentRole('customer');
          localStorage.setItem('monikaz_user', JSON.stringify(newProfile));
        }
        const saved = localStorage.getItem('monikaz_pending_booking');
        if (saved) {
          try {
            const intent = JSON.parse(saved);
            localStorage.removeItem('monikaz_pending_booking');
            if (intent) { setPreselectedService(intent.service); setPreselectedStaff(intent.staff); setIsBookingModalOpen(true); }
          } catch {}
        }
      }
    });
    return () => unsub();
  }, []);

  const addNotification = (notif: Notification) => {
    setNotifications(prev => [notif, ...prev]);
    playNotificationSound();
  };

  // Web Audio notification chime — no file needed
  function playNotificationSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    } catch { /* audio not available */ }
  }

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  // Actions
  const openBookingWithAuthGuard = (service: Service | null, staff: Staff | null) => {
    if (!currentUser) {
      const intent = { service, staff };
      setPendingBookingIntent(intent);
      localStorage.setItem('monikaz_pending_booking', JSON.stringify(intent));
      setIsAuthModalOpen(true);
      return;
    }
    setPendingBookingIntent(null);
    localStorage.removeItem('monikaz_pending_booking');
    setPreselectedService(service);
    setPreselectedStaff(staff);
    setIsBookingModalOpen(true);
  };

  const handleOpenBookingForService = (service: Service) => {
    openBookingWithAuthGuard(service, null);
  };

  const handleOpenBookingWithStaff = (staff: Staff) => {
    openBookingWithAuthGuard(services.length > 0 ? services[0] : null, staff);
  };

  const handleOpenDefaultBooking = () => {
    openBookingWithAuthGuard(services.length > 0 ? services[0] : null, null);
  };

  const handleBookingSubmitted = async (bookingData: Partial<Booking>) => {
    const data = { ...bookingData };
    if (!data.customer_id && currentUser) data.customer_id = currentUser.id;
    const created = await api.createBooking(data);
    setBookings(prev => [created, ...prev]);
    loadData();
    const updatedLogs = await api.getEmailLogs().catch(() => []);
    setEmailLogs(updatedLogs);

    // Take customer to their appointments after booking
    if (currentRole === 'customer' || !currentUser) {
      handleSetActiveTab('bookings');
    }

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
    const intent = pendingBookingIntent;
    if (intent) {
      setPendingBookingIntent(null);
      localStorage.removeItem('monikaz_pending_booking');
      setPreselectedService(intent.service);
      setPreselectedStaff(intent.staff);
      setIsBookingModalOpen(true);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    localStorage.removeItem('monikaz_user');
    signOut();
    if (activeTab === 'admin') {
      handleSetActiveTab('services');
    }
    setIsAuthModalOpen(false);
  };

  const handleUpdateProfile = (updated: Profile) => {
    setCurrentUser(updated);
    setCurrentRole(updated.role);
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'admin' && currentUser?.role !== 'admin') {
      setRequiredRoleForAdmin(true);
      setIsAuthModalOpen(true);
    }
  };

  const handleTabChange = (tab: 'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about') => {
    if (tab === 'admin') {
      if (currentRole !== 'admin' || currentUser?.role !== 'admin') {
        setCurrentRole('admin');
        setRequiredRoleForAdmin(true);
        setIsAuthModalOpen(true);
        return;
      }
    }
    handleSetActiveTab(tab);
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
          onOpenBooking={handleOpenDefaultBooking}
          unreadCount={unreadNotifCount}
          onOpenNotifications={() => handleSetActiveTab('bookings')}
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
          bestOffer={(() => {
            const withDiscount = services.filter(s => s.discount_percent && s.discount_percent > 0 && s.is_active);
            if (withDiscount.length === 0) return '';
            const best = withDiscount.reduce((a, b) => (a.discount_percent || 0) > (b.discount_percent || 0) ? a : b);
            return `🔥 ${best.discount_percent}% OFF on ${best.name} — Book now!`;
          })()}
        />

        {/* Main Content Render */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
              {[1,2,3].map(i => (
                <div key={i} className="h-48 bg-stone-100 rounded-3xl animate-pulse" />
              ))}
            </motion.div>
          ) : activeTab === 'services' && (
            <motion.div key="services" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <Hero
                onOpenBooking={handleOpenDefaultBooking}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onSelectCategory={setSelectedCategory}
              />

              {/* Pinned Scroll Storytelling Experience */}
              <PinnedJourney
                onOpenBooking={handleOpenDefaultBooking}
              />

              <ServiceCatalog
                services={services}
                onBookService={handleOpenBookingForService}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />

              {/* Salon Hours & Available Times */}
              <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="bg-white rounded-3xl border border-[#E3D8CE] p-5 sm:p-7 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#A87B51] font-bold">Schedule</span>
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] mt-1">Available Times</h2>
                      <p className="text-xs text-[#8A7568] mt-1">We're open 7 days a week. Book your slot at a time that suits you.</p>
                    </div>
                    <button
                      onClick={handleOpenDefaultBooking}
                      className="bg-[#2C221E] hover:bg-[#4A3933] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-2 self-start min-h-[44px]"
                    >
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Book Now</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {['Mon–Fri', 'Saturday', 'Sunday'].map(day => (
                      <div key={day} className="bg-[#FAF6F3] rounded-2xl p-4 border border-[#E3D8CE]">
                        <p className="text-sm font-bold text-[#2C221E]">{day}</p>
                        <p className="text-xs text-[#A87B51] font-semibold mt-1">10:00 AM – 6:00 PM</p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {Array.from({ length: 16 }, (_, i) => {
                            const h = Math.floor(i * 0.5 + 10);
                            const m = i % 2 === 0 ? '00' : '30';
                            const label = `${h.toString().padStart(2, '0')}:${m}`;
                            return (
                              <button
                                key={label}
                                onClick={handleOpenDefaultBooking}
                                className="px-2.5 py-1.5 rounded-lg bg-white border border-[#E3D8CE] text-[11px] font-medium text-[#68584E] hover:bg-[#2C221E] hover:text-white transition-colors cursor-pointer"
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* Interactive Transformation Reveal Slider */}
              <TransformationReveal />
            </motion.div>
          )}

          {activeTab === 'staff' && (
            <motion.div key="staff" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <StaffCatalog
                staffList={staffList}
                onBookWithStaff={handleOpenBookingWithStaff}
              />
            </motion.div>
          )}

          {activeTab === 'bookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <CustomerDashboard
                bookings={bookings}
                reviews={reviews}
                onCancelBooking={handleCancelBooking}
                onOpenReviewModal={handleOpenReviewModal}
                emailLogs={emailLogs}
              />
            </motion.div>
          )}

          {activeTab === 'admin' && (
            <motion.div key="admin" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
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
            </motion.div>
          )}

          {activeTab === 'contact' && (
            <motion.div key="contact" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
              <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
              <h2 className="font-serif text-3xl font-bold text-[#2C221E] flex items-center gap-2">
                <Phone className="w-6 h-6 text-[#A87B51]" /> Contact Us
              </h2>
              <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-sm space-y-5">
                {shop && (
                  <div className="space-y-2">
                    <h3 className="font-serif text-xl font-bold text-[#2C221E]">{shop.name}</h3>
                    {addresses && addresses.length > 0 && (
                      <p className="text-sm text-[#68584E] flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-[#A87B51] shrink-0 mt-0.5" />
                        {addresses.map(a => a.address).join(', ')}
                      </p>
                    )}
                  </div>
                )}
                {socialMedia && socialMedia.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-sm text-[#2C221E]">Reach us on</h4>
                    <div className="flex flex-wrap gap-3">
                      {socialMedia.map(sm => (
                        <a
                          key={sm.id}
                          href={sm.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FAF6F3] border border-[#E3D8CE] hover:bg-[#E8DFD8] transition-colors text-sm font-semibold text-[#2C221E]"
                        >
                          {sm.media_name === 'whatsapp' && <MessageCircle className="w-5 h-5 text-green-600" />}
                          {sm.media_name === 'instagram' && <span className="text-pink-600 text-lg">📷</span>}
                          {sm.media_name === 'facebook' && <span className="text-blue-600 font-bold text-lg">f</span>}
                          <span className="capitalize">{sm.media_name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                {(!socialMedia || socialMedia.length === 0) && (
                  <p className="text-sm text-stone-500 italic">No contact links added yet. Check back soon!</p>
                )}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-sm text-amber-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <span>Visit us at our salon or reach out via WhatsApp for quick responses. We'd love to hear from you!</span>
              </div>
            </div>
            </motion.div>
          )}

          {activeTab === 'about' && (
            <motion.div key="about" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25, ease: 'easeOut' }}>
            <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
              <h2 className="font-serif text-3xl font-bold text-[#2C221E]">About Monikazz Salon & Academy</h2>

              <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="w-full sm:w-48 h-48 rounded-2xl overflow-hidden shrink-0 bg-[#FAF6F3] border border-[#E3D8CE]">
                    <img
                      src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=400"
                      alt="Monikazz Salon & Academy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-serif text-xl font-bold text-[#2C221E]">Our Story</h3>
                    <p className="text-sm text-[#68584E] leading-relaxed">
                      Monikazz Salon & Academy is a premium beauty and wellness destination located in the heart of Bandra, Mumbai. 
                      We specialize in hair styling, skincare, bridal makeup, nail art, and body spa treatments — 
                      offering a complete self-care experience under one roof.
                    </p>
                    <p className="text-sm text-[#68584E] leading-relaxed">
                      Founded with a passion for making every woman feel beautiful and confident, our salon combines 
                      modern techniques with traditional hospitality. Every treatment is tailored to your unique needs 
                      using high-quality, organic products.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-5 border border-[#E3D8CE] text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center mx-auto">
                    <Scissors className="w-5 h-5 text-[#A87B51]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#2C221E]">Expert Stylists</h4>
                  <p className="text-xs text-[#68584E]">Certified professionals with years of experience in advanced beauty treatments.</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E3D8CE] text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center mx-auto">
                    <Sparkles className="w-5 h-5 text-[#A87B51]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#2C221E]">Premium Products</h4>
                  <p className="text-xs text-[#68584E]">We use only 100% organic and dermatologically tested products for every service.</p>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-[#E3D8CE] text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center mx-auto">
                    <MapPin className="w-5 h-5 text-[#A87B51]" />
                  </div>
                  <h4 className="font-bold text-sm text-[#2C221E]">Prime Location</h4>
                  <p className="text-xs text-[#68584E]">Conveniently located in Bandra West with easy access and a relaxing ambiance.</p>
                </div>
              </div>

              <div className="bg-[#FAF6F3] rounded-3xl p-6 border border-[#E3D8CE] space-y-3">
                <h3 className="font-serif text-lg font-bold text-[#2C221E]">Our Services</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  {['Hair Styling & Keratin Treatment', 'Facial & Skincare', 'Bridal Makeup & Hair', 'Manicure & Pedicure', 'Nail Art & Extensions', 'Body Spa & Massage'].map(s => (
                    <div key={s} className="flex items-center gap-2 text-[#68584E]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A87B51]" />
                      <span>{s}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </motion.div>
          )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer shop={shop} addresses={addresses} socialMedia={socialMedia} onNavigate={(tab) => handleSetActiveTab(tab)} />

        {/* Interactive Booking Wizard Modal */}
        <BookingFlowModal
          key={currentUser?.id || 'no-user'}
          isOpen={isBookingModalOpen}
          onClose={() => setIsBookingModalOpen(false)}
          services={services}
          staffList={staffList}
          existingBookings={bookings}
          preselectedService={preselectedService}
          preselectedStaff={preselectedStaff}
          currentUser={currentUser}
          onBookingSubmitted={handleBookingSubmitted}
          shop={shop}
          socialMedia={socialMedia}
          addresses={addresses}
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
          onOpenProfile={() => setIsProfileModalOpen(true)}
        />

        {/* Profile Editor Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateProfile={handleUpdateProfile}
        />

      </div>
    </SmoothScroll>
  );
}
