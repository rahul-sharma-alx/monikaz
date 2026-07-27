import React, { useState, useEffect, useCallback } from 'react';
import { UserRole, Service, Staff, Booking, Review, Notification, BookingStatus, SupabaseConfig } from './types';
import { api } from './services/api';
import { getSupabaseCredentials, saveSupabaseCredentials } from './lib/supabase';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ServiceCatalog } from './components/ServiceCatalog';
import { StaffCatalog } from './components/StaffCatalog';
import { BookingFlowModal } from './components/BookingFlowModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ReviewModal } from './components/ReviewModal';
import { NotificationToast } from './components/NotificationToast';
import { Footer } from './components/Footer';

export default function App() {
  // App Role & Active Tab
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<'services' | 'staff' | 'bookings' | 'admin'>('services');

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

  // Load Data
  const loadData = useCallback(async () => {
    try {
      const [sData, stData, bData, rData, eData] = await Promise.all([
        api.getServices(),
        api.getStaff(),
        api.getBookings(),
        api.getReviews(),
        api.getEmailLogs().catch(() => [])
      ]);

      setServices(sData);
      setStaffList(stData);
      setBookings(bData);
      setReviews(rData);
      setEmailLogs(eData);
    } catch (err) {
      console.error('Failed to load initial parlour data:', err);
    }
  }, []);

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
    const created = await api.createService(srvData);
    setServices(prev => [created, ...prev]);
  };

  const handleUpdateService = async (id: string, srvData: Partial<Service>) => {
    const updated = await api.updateService(id, srvData);
    setServices(prev => prev.map(s => s.id === id ? updated : s));
  };

  const handleCreateStaff = async (stfData: Partial<Staff>) => {
    const created = await api.createStaff(stfData);
    setStaffList(prev => [...prev, created]);
  };

  const handleUpdateStaff = async (id: string, stfData: Partial<Staff>) => {
    const updated = await api.updateStaff(id, stfData);
    setStaffList(prev => prev.map(st => st.id === id ? updated : st));
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
    <div className="min-h-screen bg-[#FAF6F3] text-[#2C221E] font-sans antialiased flex flex-col selection:bg-[#E8C5B8] selection:text-[#2C221E]">
      
      {/* Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBooking={() => {
          setPreselectedService(services.length > 0 ? services[0] : null);
          setPreselectedStaff(null);
          setIsBookingModalOpen(true);
        }}
        unreadCount={unreadNotifCount}
        onOpenNotifications={() => setActiveTab('bookings')}
        isConnected={isConnected}
        onOpenSupabaseModal={() => {
          setCurrentRole('admin');
          setActiveTab('admin');
        }}
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

            <ServiceCatalog
              services={services}
              onBookService={handleOpenBookingForService}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
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
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

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

    </div>
  );
}
