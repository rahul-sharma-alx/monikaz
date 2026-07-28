import React, { useState } from 'react';
import { Service, Staff, Booking, Review, BookingStatus, SupabaseConfig, Profile, UserRole, PermissionKey, Shop, Address, SocialMedia } from '../types';
import {
  TrendingUp, Calendar, Users, Star, DollarSign, Plus, Edit,
  CheckCircle2, XCircle, Clock, Search, Filter, ShieldCheck, Database, Copy, Check,
  PanelLeftClose, PanelLeftOpen, LayoutDashboard, Scissors, Lock, ShieldAlert, Key, CheckSquare, Square, Mail, Phone, User, Store, MapPin, Link as LinkIcon, PlusCircle, Trash2, QrCode
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getTodayString } from '../data/initialData';
import { ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, hasPermission } from '../lib/permissions';
import { motion } from 'motion/react';

interface AdminDashboardProps {
  currentUser: Profile | null;
  services: Service[];
  staffList: Staff[];
  bookings: Booking[];
  reviews: Review[];
  shop: Shop | null;
  addresses: Address[];
  socialMedia: SocialMedia[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onCreateService: (service: Partial<Service>) => Promise<void>;
  onUpdateService: (id: string, service: Partial<Service>) => Promise<void>;
  onCreateStaff: (staff: Partial<Staff>) => Promise<void>;
  onUpdateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  onRespondToReview: (reviewId: string, response: string) => Promise<void>;
  onUpdateShop: (data: { name?: string; logo_url?: string }) => Promise<void>;
  onAddAddress: (address: string) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onAddSocialMedia: (media_name: string, link: string) => Promise<void>;
  onDeleteSocialMedia: (id: string) => Promise<void>;
  supabaseConfig: SupabaseConfig;
  onSaveSupabaseCredentials: (url: string, key: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  services,
  staffList,
  bookings,
  reviews,
  shop,
  addresses,
  socialMedia,
  onUpdateBookingStatus,
  onCreateService,
  onUpdateService,
  onCreateStaff,
  onUpdateStaff,
  onRespondToReview,
  onUpdateShop,
  onAddAddress,
  onDeleteAddress,
  onAddSocialMedia,
  onDeleteSocialMedia,
  supabaseConfig,
  onSaveSupabaseCredentials,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'bookings' | 'services' | 'staff' | 'reviews' | 'leads' | 'security' | 'supabase' | 'shop' | 'qr'>(() => {
    const saved = sessionStorage.getItem('monikaz_adminTab');
    if (saved) return saved as any;
    return 'overview';
  });
  const handleSetAdminTab = (tab: typeof adminTab) => {
    sessionStorage.setItem('monikaz_adminTab', tab);
    setAdminTab(tab);
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);

  // Security & Permission Checks
  const canViewAnalytics = hasPermission(currentUser, 'view_analytics');
  const canManageBookings = hasPermission(currentUser, 'manage_bookings');
  const canManageServices = hasPermission(currentUser, 'manage_services');
  const canManageStaff = hasPermission(currentUser, 'manage_staff');
  const canManageReviews = hasPermission(currentUser, 'manage_reviews');
  const canManagePermissions = hasPermission(currentUser, 'manage_permissions');

  // Filters
  const [bookingFilterDate, setBookingFilterDate] = useState<string>('');
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('');
  const [bookingFilterStaff, setBookingFilterStaff] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Service Modal State
  const [isServiceModalOpen, setIsServiceModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceForm, setServiceForm] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 100,
    duration_minutes: 60,
    category: 'Hair & Styling',
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    discount_percent: 0
  });

  // Staff Modal State
  const [isStaffModalOpen, setIsStaffModalOpen] = useState<boolean>(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [staffForm, setStaffForm] = useState<Partial<Staff>>({
    full_name: '',
    bio: '',
    specialties: ['Styling'],
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    is_active: true
  });

  // Review Response State
  const [respondingReviewId, setRespondingReviewId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState<string>('');

  // Supabase Config Form
  const [sbUrlInput, setSbUrlInput] = useState<string>(supabaseConfig.url);
  const [sbKeyInput, setSbKeyInput] = useState<string>(supabaseConfig.anonKey);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  // Stats
  const todayStr = getTodayString(0);
  const todayBookings = bookings.filter(b => b.booking_date === todayStr);
  const todayRevenue = todayBookings
    .filter(b => b.status !== 'cancelled' && b.status !== 'no_show')
    .reduce((sum, b) => sum + b.service_price, 0);

  const completedCount = bookings.filter(b => b.status === 'completed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'completed' || b.status === 'confirmed' || b.status === 'in_progress')
    .reduce((sum, b) => sum + b.service_price, 0);
  const pendingLeads = bookings.filter(b => b.status === 'pending').length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
    : '4.95';

  // Service popularity
  const serviceCounts: Record<string, number> = {};
  bookings.forEach(b => { serviceCounts[b.service_name] = (serviceCounts[b.service_name] || 0) + 1; });
  const topServices = Object.entries(serviceCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Staff performance
  const staffCounts: Record<string, { count: number; revenue: number }> = {};
  bookings.filter(b => b.status !== 'cancelled').forEach(b => {
    if (!b.staff_name) return;
    if (!staffCounts[b.staff_name]) staffCounts[b.staff_name] = { count: 0, revenue: 0 };
    staffCounts[b.staff_name].count++;
    staffCounts[b.staff_name].revenue += b.service_price;
  });
  const staffPerformance = Object.entries(staffCounts).sort((a, b) => b[1].count - a[1].count);

  // Filtered Bookings Table
  const filteredBookings = bookings.filter(b => {
    if (bookingFilterDate && b.booking_date !== bookingFilterDate) return false;
    if (bookingFilterStatus && b.status !== bookingFilterStatus) return false;
    if (bookingFilterStaff && b.staff_id !== bookingFilterStaff) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        b.customer_name.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSaveService = async () => {
    try {
      if (editingService) {
        await onUpdateService(editingService.id, serviceForm);
      } else {
        await onCreateService(serviceForm);
      }
      setIsServiceModalOpen(false);
      setEditingService(null);
    } catch {
      // error notification already shown by App.tsx handlers
    }
  };

  const handleSaveStaff = async () => {
    try {
      if (editingStaff) {
        await onUpdateStaff(editingStaff.id, staffForm);
      } else {
        await onCreateStaff(staffForm);
      }
      setIsStaffModalOpen(false);
      setEditingStaff(null);
    } catch {
      // error notification already shown by App.tsx handlers
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-8xl mx-auto space-y-8">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#2C221E] via-[#4A3933] to-[#2C221E] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C380] text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Admin Dashboard
          </div>
          <h1 className="font-serif text-3xl font-bold mt-2">Manage Your Salon</h1>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            View bookings, manage staff, update services, respond to reviews, and configure salon settings.
          </p>
        </div>

        {/* Live Admin Status Pill */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-stone-200 text-xs font-bold shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Active Session ({bookings.length} Bookings)</span>
        </div>
      </div>

      {/* Main Admin Sidebar + Content Layout */}
      <div className="flex flex-col lg:flex-row gap-6 min-h-[600px] items-start">
        
        {/* Mobile Screen Horizontal Nav Bar (Prevents vertical sidebar from covering mobile screen) */}
        <div className="lg:hidden w-full bg-[#2C221E] text-white rounded-2xl p-2 shadow-lg border border-[#D4AF37]/30 sticky top-[80px] z-30">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-1">
            {[
              { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
              { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookings.length },
              { id: 'services', label: 'Services', icon: Scissors, count: services.length },
              { id: 'staff', label: 'Staff Roster', icon: Users, count: staffList.length },
              { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
              { id: 'leads', label: 'Leads', icon: User, count: pendingLeads },
              { id: 'security', label: 'Roles & Permissions', icon: Key, count: ALL_PERMISSIONS.length },
              { id: 'shop', label: 'Shop Settings', icon: Store, count: null },
              { id: 'qr', label: 'Generate QR', icon: QrCode, count: null },
              { id: 'supabase', label: 'Supabase SQL', icon: Database, count: null },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = adminTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSetAdminTab(item.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 min-h-[44px] ${
                    isActive
                      ? 'bg-[#D4AF37] text-[#2C221E] shadow-xs font-extrabold'
                      : 'bg-[#4A3933]/70 text-stone-300 hover:bg-[#4A3933] hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#2C221E]' : 'text-[#D4AF37]'}`} />
                  <span>{item.label}</span>
                  {item.count !== null && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-[#2C221E] text-white' : 'bg-[#2C221E]/60 text-stone-200'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Collapsible Left Command Center Sidebar (Desktop Only) */}
        <aside
          className={`hidden lg:flex bg-[#2C221E] text-white rounded-3xl p-4 shadow-xl border border-[#D4AF37]/30 transition-all duration-300 flex-col justify-between ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          } shrink-0 sticky top-24 z-30`}
        >
          <div className="space-y-6">
            
            {/* Sidebar Header & Toggle Button */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#4A3933]">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-white truncate">Command Center</h4>
                    <p className="text-[10px] text-stone-400">Sidebar Navigation</p>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
                className={`p-2 rounded-xl bg-[#4A3933] hover:bg-[#5C4840] text-[#D4AF37] transition-colors cursor-pointer ${
                  isSidebarCollapsed ? 'mx-auto' : ''
                }`}
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4.5 h-4.5" /> : <PanelLeftClose className="w-4.5 h-4.5" />}
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="space-y-1.5">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard, count: null },
                { id: 'bookings', label: 'Bookings', icon: Calendar, count: bookings.length },
                { id: 'services', label: 'Services', icon: Scissors, count: services.length },
                { id: 'staff', label: 'Staff Roster', icon: Users, count: staffList.length },
                { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
                { id: 'leads', label: 'Leads', icon: User, count: pendingLeads },
                { id: 'security', label: 'Roles & Permissions', icon: Key, count: ALL_PERMISSIONS.length },
                { id: 'shop', label: 'Shop Settings', icon: Store, count: null },
                { id: 'qr', label: 'Generate QR', icon: QrCode, count: null },
                { id: 'supabase', label: 'Supabase SQL', icon: Database, count: null },
              ].map((item, i) => {
                const Icon = item.icon;
                const isActive = adminTab === item.id;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <button
                    onClick={() => handleSetAdminTab(item.id as any)}
                    title={isSidebarCollapsed ? `${item.label} ${item.count !== null ? `(${item.count})` : ''}` : undefined}
                    className={`w-full flex items-center rounded-2xl py-3 px-3 text-xs font-bold transition-all cursor-pointer ${
                      isSidebarCollapsed ? 'justify-center' : 'justify-between'
                    } ${
                      isActive
                        ? 'bg-[#D4AF37] text-[#2C221E] shadow-sm font-extrabold'
                        : 'text-stone-300 hover:bg-[#4A3933] hover:text-white'
                    }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#2C221E]' : 'text-[#D4AF37]'}`} />
                      {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                    </div>

                    {!isSidebarCollapsed && item.count !== null && (
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                          isActive ? 'bg-[#2C221E] text-white' : 'bg-[#4A3933] text-stone-300'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                    </button>
                  </motion.div>
                );
              })}
            </nav>
          </div>

          {/* Footer in expanded mode */}
          {!isSidebarCollapsed && (
            <div className="mt-8 pt-4 border-t border-[#4A3933] text-[11px] text-stone-400 space-y-1">
              <p className="font-semibold text-stone-300">Monikazz Admin Portal</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Sync Active
              </p>
            </div>
          )}
        </aside>

        {/* Right Main Content Panel */}
        <main className="flex-1 min-w-0 space-y-6 w-full">

      {/* OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Today's Bookings</span>
                <Calendar className="w-5 h-5 text-[#A87B51]" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{todayBookings.length}</p>
              <p className="text-[10px] text-stone-500">{todayStr}</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Today's Revenue</span>
                <span className="w-5 h-5 text-emerald-600 font-serif font-bold text-lg flex items-center justify-center">₹</span>
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">₹{todayRevenue}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">Active bookings</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Total Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">₹{totalRevenue}</p>
              <p className="text-[10px] text-stone-500">Across all bookings</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Pending Leads</span>
                <User className="w-5 h-5 text-amber-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{pendingLeads}</p>
              <p className="text-[10px] text-amber-600 font-semibold">Awaiting confirmation</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Staff</span>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{staffList.filter(s => s.is_active).length}</p>
              <p className="text-[10px] text-stone-500">Active team members</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Services</span>
                <Scissors className="w-5 h-5 text-[#A87B51]" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{services.filter(s => s.is_active).length}</p>
              <p className="text-[10px] text-stone-500">Active services</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Completed</span>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{completedCount}</p>
              <p className="text-[10px] text-stone-500">Successful sessions</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#8A7568] uppercase">Avg Rating</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{avgRating} ★</p>
              <p className="text-[10px] text-stone-500">From {reviews.length} reviews</p>
            </div>
          </div>

          {/* Top Services & Staff Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Services */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Popular Services</h3>
              {topServices.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No bookings yet.</p>
              ) : (
                <div className="space-y-3">
                  {topServices.map(([name, count], i) => {
                    const maxCount = topServices[0][1];
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[#2C221E] truncate mr-2">{name}</span>
                          <span className="text-[#A87B51] font-bold">{count} bookings</span>
                        </div>
                        <div className="w-full bg-[#F2ECE6] rounded-full h-2">
                          <div className="bg-[#A87B51] rounded-full h-2 transition-all" style={{ width: `${(count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Staff Performance */}
            <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-4">
              <h3 className="font-serif text-lg font-bold text-[#2C221E]">Staff Performance</h3>
              {staffPerformance.length === 0 ? (
                <p className="text-xs text-stone-500 italic">No data yet.</p>
              ) : (
                <div className="space-y-3">
                  {staffPerformance.map(([name, data]) => {
                    const maxCount = staffPerformance[0][1].count;
                    return (
                      <div key={name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-[#2C221E]">{name}</span>
                          <span className="text-stone-500">{data.count} bookings • ₹{data.revenue}</span>
                        </div>
                        <div className="w-full bg-[#F2ECE6] rounded-full h-2">
                          <div className="bg-[#D4AF37] rounded-full h-2 transition-all" style={{ width: `${(data.count / maxCount) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-[#2C221E]">Today's Schedule</h3>
              <button onClick={() => handleSetAdminTab('bookings')} className="text-xs font-bold text-[#A87B51] underline cursor-pointer">View All</button>
            </div>
            {todayBookings.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">No appointments scheduled for today.</p>
            ) : (
              <div className="divide-y divide-[#F2ECE6]">
                {todayBookings.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#2C221E] min-w-[80px]">{b.start_time} — {b.end_time}</span>
                      <span className="font-serif font-bold text-[#A87B51]">{b.service_name}</span>
                      <span className="text-stone-500">({b.customer_name})</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-500">Stylist: {b.staff_name}</span>
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                        className="bg-[#FAF6F3] border border-[#E3D8CE] rounded-full px-3 py-1 font-semibold text-xs text-[#2C221E]"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKINGS MANAGEMENT TAB */}
      {adminTab === 'bookings' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">All Appointments Master List</h3>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <input
                type="text"
                placeholder="Search customer name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#FAF6F3] border border-[#E3D8CE] rounded-full px-3.5 py-2 text-[#2C221E] focus:outline-hidden"
              />

              <select
                value={bookingFilterStatus}
                onChange={(e) => setBookingFilterStatus(e.target.value)}
                className="bg-[#FAF6F3] border border-[#E3D8CE] rounded-full px-3 py-2 text-[#2C221E]"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <select
                value={bookingFilterStaff}
                onChange={(e) => setBookingFilterStaff(e.target.value)}
                className="bg-[#FAF6F3] border border-[#E3D8CE] rounded-full px-3 py-2 text-[#2C221E]"
              >
                <option value="">All Stylists</option>
                {staffList.map(st => (
                  <option key={st.id} value={st.id}>{st.full_name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Bookings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF6F3] text-[#8A7568] uppercase tracking-wider border-b border-[#E3D8CE]">
                <tr>
                  <th className="p-3">ID / Customer</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Stylist</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Live Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE6]">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-[#FAF6F3]/50 transition-colors">
                    <td className="p-3">
                      <p className="font-bold text-[#2C221E]">{b.customer_name}</p>
                      <p className="text-[10px] text-stone-400 font-mono">#{b.id}</p>
                    </td>
                    <td className="p-3 font-semibold text-[#A87B51]">{b.service_name}</td>
                    <td className="p-3">
                      <p className="font-bold text-[#2C221E]">{b.booking_date}</p>
                      <p className="text-[#8A7568]">{b.start_time} - {b.end_time}</p>
                    </td>
                    <td className="p-3 text-[#52433A] font-medium">{b.staff_name}</td>
                    <td className="p-3 font-bold text-[#2C221E]">₹{b.service_price}</td>
                    <td className="p-3">
                      <select
                        value={b.status}
                        onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                        className="bg-[#FAF6F3] border border-[#E3D8CE] rounded-full px-3 py-1 font-semibold text-xs text-[#2C221E] cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SERVICES MANAGEMENT TAB */}
      {adminTab === 'services' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Manage Beauty Services Menu</h3>
            <button
              onClick={() => {
                setEditingService(null);
                setServiceForm({
                  name: '',
                  description: '',
                  price: 100,
                  duration_minutes: 60,
                  category: 'Hair & Styling',
                  image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
                  is_active: true
                });
                setIsServiceModalOpen(true);
              }}
              className="bg-[#2C221E] hover:bg-[#4A3933] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((srv) => (
              <div key={srv.id} className="p-5 rounded-2xl border border-[#E3D8CE] bg-[#FAF6F3] space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-[#A87B51]">{srv.category}</span>
                    <span className="font-bold text-[#2C221E]">
                      {srv.discount_percent && srv.discount_percent > 0 ? (
                        <span>₹{Math.round(srv.price * (1 - srv.discount_percent / 100))} <span className="text-[10px] text-stone-400 line-through">₹{srv.price}</span></span>
                      ) : `₹${srv.price}`}
                    </span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#2C221E] mt-1">{srv.name}</h4>
                  {srv.discount_percent && srv.discount_percent > 0 && (
                    <span className="inline-block text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">{srv.discount_percent}% OFF</span>
                  )}
                  <p className="text-xs text-[#68584E] mt-1 line-clamp-2">{srv.description}</p>
                </div>

                <div className="pt-2 border-t border-[#E8DFD8] flex items-center justify-between text-xs">
                  <span className="text-stone-500">{srv.duration_minutes} mins</span>
                  <button
                    onClick={() => {
                      setEditingService(srv);
                      setServiceForm(srv);
                      setIsServiceModalOpen(true);
                    }}
                    className="text-[#2C221E] font-bold underline cursor-pointer"
                  >
                    Edit Service
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Price History */}
          <div className="bg-[#FAF6F3] rounded-2xl p-4 border border-[#E3D8CE]">
            <h4 className="font-serif text-lg font-bold text-[#2C221E] mb-2">Price & Discount History</h4>
            <PriceHistoryView />
          </div>
        </div>
      )}

      {/* STAFF MANAGEMENT TAB */}
      {adminTab === 'staff' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Staff & Team Roster</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] text-[#8C6D58] text-xs font-bold">
                  {staffList.length} Team Members
                </span>
              </div>
              <p className="text-xs text-[#8A7568] mt-1">
                Manage team profiles, assigned roles (Admin, Manager, Staff), contact details, and custom permission clearances.
              </p>
            </div>

            <button
              disabled={!canManageStaff}
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  full_name: '',
                  bio: '',
                  role: 'staff',
                  email: '',
                  phone: '',
                  specialties: ['Styling & Cuts'],
                  photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                  is_active: true,
                  permissions: DEFAULT_ROLE_PERMISSIONS.staff
                });
                setIsStaffModalOpen(true);
              }}
              className={`px-4 py-2.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                canManageStaff
                  ? 'bg-[#2C221E] hover:bg-[#4A3933] text-white cursor-pointer shadow-sm'
                  : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              }`}
            >
              {canManageStaff ? <Plus className="w-4 h-4 text-[#D4AF37]" /> : <Lock className="w-4 h-4" />}
              <span>{canManageStaff ? 'Add Staff Member' : 'Staff Addition Locked'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((stf) => {
              const staffRole = stf.role || 'staff';
              const assignedPerms = stf.permissions || DEFAULT_ROLE_PERMISSIONS[staffRole] || [];

              return (
                <div key={stf.id} className="p-5 rounded-2xl border border-[#E3D8CE] bg-[#FAF6F3] space-y-4 flex flex-col justify-between shadow-2xs relative overflow-hidden">
                  
                  {/* Role Tag & Status */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide flex items-center gap-1 ${
                        staffRole === 'admin'
                          ? 'bg-[#2C221E] text-[#D4AF37] border border-[#D4AF37]/40'
                          : staffRole === 'manager'
                          ? 'bg-purple-900 text-purple-200 border border-purple-700'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      <span>{staffRole === 'admin' ? 'Owner / Admin' : staffRole === 'manager' ? 'Manager' : 'Staff'}</span>
                    </span>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      stf.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {stf.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Avatar & Main Info */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={stf.photo_url}
                      alt={stf.full_name}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-2xl object-cover shrink-0 border-2 border-white shadow-xs"
                    />
                    <div className="flex-1 min-w-0 text-xs space-y-1">
                      <h4 className="font-serif text-base font-bold text-[#2C221E] truncate">{stf.full_name}</h4>
                      <p className="text-amber-600 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current inline" />
                        <span>{stf.rating || 5.0} Rating ({stf.reviews_count || 12} reviews)</span>
                      </p>
                      
                      {stf.email && (
                        <p className="text-stone-500 truncate flex items-center gap-1 text-[11px]">
                          <Mail className="w-3 h-3 text-[#A87B51] shrink-0" />
                          <span>{stf.email}</span>
                        </p>
                      )}
                      {stf.phone && (
                        <p className="text-stone-500 truncate flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-[#A87B51] shrink-0" />
                          <span>{stf.phone}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Bio & Specialties */}
                  <div className="space-y-2 text-xs pt-1 border-t border-[#E8DFD8]">
                    <p className="text-stone-600 line-clamp-2 italic text-[11px]">"{stf.bio}"</p>
                    <div className="flex flex-wrap gap-1">
                      {stf.specialties.map((spec, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-[#E3D8CE] text-[10px] font-medium text-[#68584E]">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Assigned Permissions Badges */}
                  <div className="pt-2 border-t border-[#E8DFD8] space-y-1">
                    <span className="block text-[10px] uppercase font-bold text-[#8A7568]">Granted Permissions ({assignedPerms.length})</span>
                    <div className="flex flex-wrap gap-1">
                      {ALL_PERMISSIONS.map((perm) => {
                        const hasPerm = assignedPerms.includes(perm.key) || staffRole === 'admin';
                        if (!hasPerm) return null;
                        return (
                          <span
                            key={perm.key}
                            title={perm.description}
                            className="px-2 py-0.5 rounded-full bg-[#2C221E]/10 text-[#2C221E] text-[9px] font-bold flex items-center gap-1 border border-[#2C221E]/20"
                          >
                            <CheckSquare className="w-2.5 h-2.5 text-emerald-600" />
                            <span>{perm.label.split(' ')[0]}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-2 border-t border-[#E8DFD8] flex items-center justify-between">
                    <span className="text-[10px] text-stone-400">ID: {stf.id}</span>
                    <button
                      disabled={!canManageStaff}
                      onClick={() => {
                        setEditingStaff(stf);
                        setStaffForm({
                          ...stf,
                          role: stf.role || 'staff',
                          email: stf.email || '',
                          phone: stf.phone || '',
                          permissions: stf.permissions || DEFAULT_ROLE_PERMISSIONS[stf.role || 'staff']
                        });
                        setIsStaffModalOpen(true);
                      }}
                      className={`font-bold text-xs underline cursor-pointer flex items-center gap-1 ${
                        canManageStaff ? 'text-[#2C221E] hover:text-[#A87B51]' : 'text-stone-400 cursor-not-allowed'
                      }`}
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit Staff & Permissions</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ROLES & SECURITY PERMISSIONS MATRIX TAB */}
      {adminTab === 'security' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-8 shadow-sm">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E3D8CE]">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C221E] text-[#D4AF37] text-xs font-bold uppercase mb-2">
                <Key className="w-3.5 h-3.5" /> Security & Role-Based Access Control (RBAC)
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Role Permissions & Action Matrix</h3>
              <p className="text-xs text-[#8A7568] mt-1 max-w-2xl">
                Configure granular action permissions for each role. Staff members and managers can be granted custom access overrides while maintaining secure boundary checks across all endpoints.
              </p>
            </div>

            {/* Current Active User Clearance Badge */}
            <div className="p-4 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] flex items-center gap-3 shrink-0">
              <img
                src={currentUser?.avatar_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'}
                alt="Active User"
                className="w-10 h-10 rounded-full object-cover border-2 border-[#D4AF37]"
              />
              <div className="text-xs">
                <p className="font-bold text-[#2C221E]">{currentUser?.full_name || 'Active Admin'}</p>
                <p className="text-[10px] text-[#A87B51] font-semibold uppercase">
                  Role: <span className="font-extrabold">{currentUser?.role || 'Admin'}</span>
                </p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 inline" />
                  {currentUser?.role === 'admin' ? 'Root Full Clearance' : `${(currentUser?.permissions || []).length} Granted Actions`}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Role Matrix Table */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-bold text-[#2C221E]">Global Role Permission Matrix</h4>
            <div className="overflow-x-auto rounded-2xl border border-[#E3D8CE]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#2C221E] text-white">
                  <tr>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] min-w-[220px]">Permission Action</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-center w-28">Customer</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-center w-32 bg-amber-900/40 text-amber-200">Staff Role</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-center w-36 bg-purple-900/40 text-purple-200">Manager Role</th>
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[10px] text-center w-36 bg-[#D4AF37]/20 text-[#D4AF37]">Owner / Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E3D8CE] bg-white">
                  {ALL_PERMISSIONS.map((perm) => {
                    const inStaff = DEFAULT_ROLE_PERMISSIONS.staff.includes(perm.key);
                    const inManager = DEFAULT_ROLE_PERMISSIONS.manager.includes(perm.key);
                    const inAdmin = DEFAULT_ROLE_PERMISSIONS.admin.includes(perm.key);

                    return (
                      <tr key={perm.key} className="hover:bg-[#FAF6F3] transition-colors">
                        <td className="p-3.5">
                          <span className="font-bold text-[#2C221E] block text-xs">{perm.label}</span>
                          <span className="text-[11px] text-[#8A7568] block mt-0.5">{perm.description}</span>
                          <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                            key: {perm.key}
                          </span>
                        </td>
                        
                        {/* Customer */}
                        <td className="p-3.5 text-center bg-stone-50/50">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-100 text-rose-600 mx-auto">
                            <XCircle className="w-4 h-4" />
                          </span>
                        </td>

                        {/* Staff */}
                        <td className="p-3.5 text-center bg-amber-50/30">
                          {inStaff ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mx-auto gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold mx-auto gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Denied
                            </span>
                          )}
                        </td>

                        {/* Manager */}
                        <td className="p-3.5 text-center bg-purple-50/30">
                          {inManager ? (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold mx-auto gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Allowed
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold mx-auto gap-1">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              Denied
                            </span>
                          )}
                        </td>

                        {/* Admin */}
                        <td className="p-3.5 text-center bg-[#D4AF37]/10 font-bold">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-[#2C221E] text-[#D4AF37] text-[10px] font-extrabold mx-auto gap-1 border border-[#D4AF37]/30">
                            <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                            Full Access
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Direct Staff Permissions Management Panel */}
          <div className="space-y-4 pt-4 border-t border-[#E3D8CE]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-serif text-lg font-bold text-[#2C221E]">Staff Permissions Live Editor</h4>
                <p className="text-xs text-[#8A7568]">Toggle specific action permissions directly for individual staff members.</p>
              </div>
              {!canManagePermissions && (
                <span className="text-xs text-rose-600 font-bold flex items-center gap-1">
                  <ShieldAlert className="w-4 h-4 inline" /> Permission Editing Restricted to Admin
                </span>
              )}
            </div>

            <div className="space-y-4">
              {staffList.map((stf) => {
                const currentRole = stf.role || 'staff';
                const currentPerms = stf.permissions || DEFAULT_ROLE_PERMISSIONS[currentRole] || [];

                return (
                  <div key={stf.id} className="p-4 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={stf.photo_url}
                          alt={stf.full_name}
                          className="w-10 h-10 rounded-full object-cover border border-[#E3D8CE]"
                        />
                        <div>
                          <h5 className="font-serif font-bold text-sm text-[#2C221E]">{stf.full_name}</h5>
                          <p className="text-[10px] text-[#8A7568]">
                            Role: <span className="font-bold uppercase text-[#2C221E]">{currentRole}</span> • Email: {stf.email || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={!canManagePermissions}
                          onClick={() => {
                            const defaultPerms = DEFAULT_ROLE_PERMISSIONS[currentRole] || [];
                            onUpdateStaff(stf.id, { permissions: defaultPerms });
                          }}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${
                            canManagePermissions
                              ? 'bg-white border border-[#E3D8CE] text-[#8C6D58] hover:bg-[#FAF6F3] cursor-pointer'
                              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          }`}
                        >
                          Reset to Role Defaults
                        </button>
                      </div>
                    </div>

                    {/* Permissions Toggle Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs pt-2 border-t border-[#E8DFD8]">
                      {ALL_PERMISSIONS.map((perm) => {
                        const isGranted = currentPerms.includes(perm.key) || currentRole === 'admin';

                        return (
                          <button
                            key={perm.key}
                            disabled={!canManagePermissions || currentRole === 'admin'}
                            onClick={() => {
                              let newPerms: PermissionKey[];
                              if (currentPerms.includes(perm.key)) {
                                newPerms = currentPerms.filter((p) => p !== perm.key);
                              } else {
                                newPerms = [...currentPerms, perm.key];
                              }
                              onUpdateStaff(stf.id, { permissions: newPerms });
                            }}
                            className={`p-2 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-between gap-1 text-left ${
                              isGranted
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                            } ${canManagePermissions && currentRole !== 'admin' ? 'cursor-pointer' : 'cursor-default'}`}
                          >
                            <span className="truncate">{perm.label.split(' ')[0]}</span>
                            {isGranted ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-stone-300 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* LEADS TAB */}
      {adminTab === 'leads' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Leads & Pending Bookings</h3>
          <p className="text-xs text-[#68584E]">Customers who booked but haven't been confirmed yet. Follow up to convert them.</p>
          {bookings.filter(b => b.status === 'pending').length === 0 ? (
            <p className="text-xs text-stone-500 italic py-6">No pending leads. All bookings are confirmed or completed.</p>
          ) : (
            <div className="space-y-3">
              {bookings.filter(b => b.status === 'pending').map(b => (
                <div key={b.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-[#2C221E]">{b.customer_name}</p>
                    <p className="text-stone-500">{b.service_name} — {b.booking_date} at {b.start_time}</p>
                    <p className="text-stone-400">Stylist: {b.staff_name} • ₹{b.service_price}</p>
                    {b.notes && <p className="text-amber-700 italic">Note: {b.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={b.status}
                      onChange={(e) => onUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                      className="bg-white border border-[#E3D8CE] rounded-full px-3 py-1.5 font-semibold text-xs text-[#2C221E]"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirm</option>
                      <option value="cancelled">Cancel</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVIEWS TAB */}
      {adminTab === 'reviews' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Customer Reviews & Responses</h3>

          <div className="space-y-4">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-5 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#2C221E]">{rev.customer_name}</span>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{rev.rating} / 5</span>
                  </div>
                </div>

                <p className="text-[#52433A] italic">"{rev.comment}"</p>
                <p className="text-stone-400">Service: {rev.service_name} • Stylist: {rev.staff_name}</p>

                {rev.admin_response ? (
                  <div className="p-3 bg-white rounded-xl border border-[#E3D8CE] text-stone-700">
                    <span className="font-bold text-[#2C221E] block">Monikazz Salon & Academy Response:</span>
                    <span>{rev.admin_response}</span>
                  </div>
                ) : (
                  <div>
                    {respondingReviewId === rev.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={2}
                          value={responseText}
                          onChange={(e) => setResponseText(e.target.value)}
                          placeholder="Write official response..."
                          className="w-full p-2 bg-white rounded-xl border border-[#E3D8CE] text-xs text-[#2C221E]"
                        />
                        <button
                          disabled={!canManageReviews}
                          onClick={async () => {
                            await onRespondToReview(rev.id, responseText);
                            setRespondingReviewId(null);
                            setResponseText('');
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            canManageReviews
                              ? 'bg-[#2C221E] text-white cursor-pointer'
                              : 'bg-stone-300 text-stone-500 cursor-not-allowed'
                          }`}
                        >
                          Send Response
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!canManageReviews}
                        onClick={() => {
                          setRespondingReviewId(rev.id);
                          setResponseText('');
                        }}
                        className={`font-bold underline text-xs ${
                          canManageReviews ? 'text-[#2C221E] cursor-pointer' : 'text-stone-400 cursor-not-allowed'
                        }`}
                      >
                        Reply to Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUPABASE SQL TAB */}
      {adminTab === 'supabase' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Supabase Postgres Schema & RLS Policies</h3>
            <p className="text-xs text-[#8A7568] mt-1">
              Copy and execute this script inside your Supabase SQL Editor to provision tables, foreign keys, and Row Level Security policies.
            </p>
          </div>

          {/* Config Input */}
          <div className="bg-[#FAF6F3] p-5 rounded-2xl border border-[#E3D8CE] space-y-4">
            <h4 className="font-serif text-base font-bold text-[#2C221E]">Connect Real Supabase Project</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-[#2C221E] mb-1">NEXT_PUBLIC_SUPABASE_URL</label>
                <input
                  type="text"
                  value={sbUrlInput}
                  onChange={(e) => setSbUrlInput(e.target.value)}
                  placeholder="https://xyz.supabase.co"
                  className="w-full bg-white p-2.5 rounded-xl border border-[#E3D8CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C221E] mb-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</label>
                <input
                  type="password"
                  value={sbKeyInput}
                  onChange={(e) => setSbKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1Ni..."
                  className="w-full bg-white p-2.5 rounded-xl border border-[#E3D8CE]"
                />
              </div>
            </div>

            <button
              onClick={() => onSaveSupabaseCredentials(sbUrlInput, sbKeyInput)}
              className="px-5 py-2.5 bg-[#2C221E] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#3D2F2A]"
            >
              Save Credentials
            </button>
          </div>

          {/* DDL Code Box */}
          <div className="relative">
            <button
              onClick={handleCopySql}
              className="absolute top-3 right-3 bg-[#D4AF37] text-[#2C221E] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer shadow-xs"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
            </button>

            <pre className="p-4 bg-stone-900 text-stone-200 rounded-2xl text-[11px] overflow-x-auto max-h-96 font-mono leading-relaxed">
              {SUPABASE_SQL_SCHEMA}
            </pre>
          </div>
        </div>
      )}

      {/* SHOP SETTINGS */}
      {adminTab === 'shop' && (
        <ShopSettings
          shop={shop}
          addresses={addresses}
          socialMedia={socialMedia}
          onUpdateShop={onUpdateShop}
          onAddAddress={onAddAddress}
          onDeleteAddress={onDeleteAddress}
          onAddSocialMedia={onAddSocialMedia}
          onDeleteSocialMedia={onDeleteSocialMedia}
        />
      )}

      {/* QR GENERATOR */}
      {adminTab === 'qr' && <QrGenerator />}

        </main>
      </div>

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 border border-[#E3D8CE] shadow-2xl max-h-[90vh] flex flex-col my-auto overflow-hidden">
            <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#E3D8CE]">
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C221E]">
                {editingService ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button
                onClick={() => setIsServiceModalOpen(false)}
                className="w-11 h-11 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center text-stone-500 hover:text-[#2C221E] cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 py-3 space-y-3 text-xs pr-1">
              <div>
                <label className="block font-bold text-[#2C221E]">Name</label>
                <input
                  type="text"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C221E]">Description</label>
                <textarea
                  rows={2}
                  value={serviceForm.description}
                  onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C221E]">Category</label>
                <select
                  value={serviceForm.category}
                  onChange={(e) => setServiceForm({ ...serviceForm, category: e.target.value as any })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                >
                  <option value="Hair & Styling">Hair & Styling</option>
                  <option value="Facial & Skincare">Facial & Skincare</option>
                  <option value="Nails & Hands">Nails & Hands</option>
                  <option value="Makeup & Bridal">Makeup & Bridal</option>
                  <option value="Body Spa">Body Spa</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C221E]">Price (₹)</label>
                  <input
                    type="number"
                    value={serviceForm.price}
                    onChange={(e) => setServiceForm({ ...serviceForm, price: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C221E]">Duration (Mins)</label>
                  <input
                    type="number"
                    value={serviceForm.duration_minutes}
                    onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: Number(e.target.value) })}
                    className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2C221E]">Discount % (0 = no offer)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={serviceForm.discount_percent ?? 0}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') { setServiceForm({ ...serviceForm, discount_percent: 0 }); return; }
                    let val = parseInt(raw, 10);
                    if (isNaN(val)) val = 0;
                    setServiceForm({ ...serviceForm, discount_percent: Math.max(0, Math.min(100, val)) });
                  }}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C221E]">Image URL</label>
                <input
                  type="text"
                  value={serviceForm.image_url}
                  onChange={(e) => setServiceForm({ ...serviceForm, image_url: e.target.value })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                  placeholder="https://images.unsplash.com/photo-..."
                />
                {serviceForm.image_url && (
                  <img src={serviceForm.image_url} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl border border-[#E3D8CE]" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
            </div>

            <div className="shrink-0 flex items-center justify-end gap-2 pt-3 border-t border-[#E3D8CE]">
              <button onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 min-h-[44px] text-xs font-bold text-stone-500 hover:text-[#2C221E] cursor-pointer">Cancel</button>
              <button onClick={handleSaveService} className="px-5 py-2 min-h-[44px] bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold rounded-full cursor-pointer">Save Service</button>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED STAFF & ROLE PERMISSIONS MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-2 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-4 sm:p-6 border border-[#E3D8CE] shadow-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col my-auto overflow-hidden">
            
            {/* Modal Header */}
            <div className="shrink-0 flex items-center justify-between pb-3 border-b border-[#E3D8CE]">
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C221E]">
                  {editingStaff ? 'Edit Staff & Permission Clearances' : 'Create Staff Profile & Assign Role'}
                </h3>
                <p className="text-xs text-[#8A7568]">Configure team credentials, avatar photo, role level, and action permissions.</p>
              </div>
              <button
                onClick={() => setIsStaffModalOpen(false)}
                className="w-11 h-11 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center text-stone-500 hover:text-[#2C221E] cursor-pointer shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Modal Body */}
            <div className="overflow-y-auto flex-1 py-3 pr-1 space-y-5 text-xs">
              
              {/* Profile Avatar & Stock Selection */}
              <div>
                <label className="block font-bold text-[#2C221E] mb-1.5">Profile Picture & Avatar *</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <img
                    src={staffForm.photo_url || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#D4AF37] shadow-sm shrink-0"
                  />
                  <div className="flex-1 w-full space-y-2">
                    <input
                      type="url"
                      value={staffForm.photo_url || ''}
                      onChange={(e) => setStaffForm({ ...staffForm, photo_url: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs text-[#2C221E]"
                    />
                    
                    {/* Stock Avatar Presets */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1">
                      <span className="text-[10px] text-[#8A7568] font-bold shrink-0">Quick Avatars:</span>
                      {[
                        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
                        'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
                      ].map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setStaffForm({ ...staffForm, photo_url: url })}
                          className="w-7 h-7 rounded-full overflow-hidden border border-[#E3D8CE] hover:border-[#D4AF37] cursor-pointer shrink-0"
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={staffForm.full_name || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                    placeholder="e.g. Natasha Kumar"
                    className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Role Assignment *</label>
                  <select
                    value={staffForm.role || 'staff'}
                    onChange={(e) => {
                      const newRole = e.target.value as UserRole;
                      setStaffForm({
                        ...staffForm,
                        role: newRole,
                        permissions: DEFAULT_ROLE_PERMISSIONS[newRole] || []
                      });
                    }}
                    className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] font-bold text-[#2C221E]"
                  >
                    <option value="staff">Staff Member (Stylist / Specialist)</option>
                    <option value="manager">Manager (Operations & Staff Supervisor)</option>
                    <option value="admin">Owner / Full Admin (Root Clearance)</option>
                  </select>
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Email Address</label>
                  <input
                    type="email"
                    value={staffForm.email || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                    placeholder="e.g. natasha@monikazparlour.com"
                    className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2C221E] mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={staffForm.phone || ''}
                    onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-[#2C221E]"
                  />
                </div>
              </div>

              {/* Specialties */}
              <div>
                <label className="block font-bold text-[#2C221E] mb-1">Specialties (comma separated)</label>
                <input
                  type="text"
                  value={Array.isArray(staffForm.specialties) ? staffForm.specialties.join(', ') : ''}
                  onChange={(e) => setStaffForm({
                    ...staffForm,
                    specialties: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="e.g. Balayage, Keratin Treatments, Bridal Glam"
                  className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-[#2C221E]"
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block font-bold text-[#2C221E] mb-1">Bio & Experience Summary</label>
                <textarea
                  rows={2}
                  value={staffForm.bio || ''}
                  onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                  placeholder="Certified Senior Stylist with expertise in organic hair treatments..."
                  className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-[#2C221E]"
                />
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="pt-3 border-t border-[#E3D8CE] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="block font-serif text-sm font-bold text-[#2C221E]">Granular Action Permissions</span>
                  <button
                    type="button"
                    onClick={() => {
                      const r = staffForm.role || 'staff';
                      setStaffForm({ ...staffForm, permissions: DEFAULT_ROLE_PERMISSIONS[r] || [] });
                    }}
                    className="text-[10px] font-bold text-[#A87B51] underline cursor-pointer"
                  >
                    Reset to Role Defaults
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => {
                    const currentPerms = staffForm.permissions || [];
                    const isGranted = currentPerms.includes(perm.key) || staffForm.role === 'admin';

                    return (
                      <label
                        key={perm.key}
                        className={`p-3 rounded-2xl border text-xs flex items-start gap-2.5 transition-all cursor-pointer ${
                          isGranted
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-[#FAF6F3] border-[#E3D8CE] text-[#68584E]'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isGranted}
                          disabled={staffForm.role === 'admin'}
                          onChange={() => {
                            let updated: PermissionKey[];
                            if (currentPerms.includes(perm.key)) {
                              updated = currentPerms.filter(p => p !== perm.key);
                            } else {
                              updated = [...currentPerms, perm.key];
                            }
                            setStaffForm({ ...staffForm, permissions: updated });
                          }}
                          className="mt-0.5 rounded border-[#E3D8CE] text-[#2C221E] focus:ring-0"
                        />
                        <div>
                          <span className="block font-bold text-[#2C221E]">{perm.label}</span>
                          <span className="block text-[10px] text-[#8A7568] font-normal leading-tight mt-0.5">{perm.description}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="is_active_staff"
                  checked={staffForm.is_active ?? true}
                  onChange={(e) => setStaffForm({ ...staffForm, is_active: e.target.checked })}
                  className="rounded border-[#E3D8CE] text-[#2C221E]"
                />
                <label htmlFor="is_active_staff" className="font-bold text-[#2C221E]">
                  Active Profile (Visible in Customer Appointment Booking)
                </label>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="shrink-0 flex items-center justify-end gap-3 pt-3 border-t border-[#E3D8CE]">
              <button
                type="button"
                onClick={() => setIsStaffModalOpen(false)}
                className="px-5 py-2.5 min-h-[44px] text-xs font-bold text-stone-500 hover:text-[#2C221E] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStaff}
                className="px-6 py-2.5 min-h-[44px] bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold rounded-full transition-all shadow-md cursor-pointer"
              >
                {editingStaff ? 'Save Staff & Permissions' : 'Create Staff Member'}
              </button>
            </div>

          </div>
        </div>
      )}

    </section>
  );
};

// ── Shop Settings Sub-Component ──
interface ShopSettingsProps {
  shop: Shop | null;
  addresses: Address[];
  socialMedia: SocialMedia[];
  onUpdateShop: (data: { name?: string; logo_url?: string }) => Promise<void>;
  onAddAddress: (address: string) => Promise<void>;
  onDeleteAddress: (id: string) => Promise<void>;
  onAddSocialMedia: (media_name: string, link: string) => Promise<void>;
  onDeleteSocialMedia: (id: string) => Promise<void>;
}

function ShopSettings({ shop, addresses, socialMedia, onUpdateShop, onAddAddress, onDeleteAddress, onAddSocialMedia, onDeleteSocialMedia }: ShopSettingsProps) {
  const [name, setName] = useState(shop?.name || '');
  const [logoUrl, setLogoUrl] = useState(shop?.logo_url || '');
  const [newAddress, setNewAddress] = useState('');
  const [newSmName, setNewSmName] = useState<'instagram' | 'facebook' | 'whatsapp'>('instagram');
  const [newSmLink, setNewSmLink] = useState('');

  const handleSaveShop = async () => {
    await onUpdateShop({ name, logo_url: logoUrl });
  };

  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    await onAddAddress(newAddress.trim());
    setNewAddress('');
  };

  const handleAddSocialMedia = async () => {
    if (!newSmLink.trim()) return;
    await onAddSocialMedia(newSmName, newSmLink.trim());
    setNewSmLink('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-2xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#2C221E]">Shop Details</h3>
        <div>
          <label className="block text-xs font-bold text-[#2C221E] mb-1">Shop Name</label>
          <input value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs" />
        </div>
        <div>
          <label className="block text-xs font-bold text-[#2C221E] mb-1">Logo URL</label>
          <input value={logoUrl} onChange={e => setLogoUrl(e.target.value)} className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs" />
          {logoUrl && <img src={logoUrl} alt="logo preview" className="w-14 h-14 rounded-2xl object-cover mt-2 border border-[#E3D8CE]" />}
        </div>
        <button onClick={handleSaveShop} className="px-5 py-2.5 min-h-[44px] bg-[#2C221E] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#3D2F2A]">Save Shop</button>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-2xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#2C221E]">Addresses</h3>
        <div className="space-y-2">
          {addresses.map(a => (
            <div key={a.id} className="flex items-center justify-between gap-2 p-3 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]">
              <span className="text-xs text-[#52433A]">{a.address}</span>
              <button onClick={() => onDeleteAddress(a.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newAddress} onChange={e => setNewAddress(e.target.value)} placeholder="Enter address..." className="flex-1 p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs" />
          <button onClick={handleAddAddress} className="px-4 py-2 min-h-[44px] bg-[#2C221E] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#3D2F2A] flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Add</button>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-2xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#2C221E]">Social Media</h3>
        <div className="space-y-2">
          {socialMedia.map(sm => (
            <div key={sm.id} className="flex items-center justify-between gap-2 p-3 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-[#A87B51]">{sm.media_name}</span>
                <span className="text-xs text-[#52433A] truncate max-w-[200px] sm:max-w-[400px]">{sm.link}</span>
              </div>
              <button onClick={() => onDeleteSocialMedia(sm.id)} className="text-rose-500 hover:text-rose-700 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <select value={newSmName} onChange={e => setNewSmName(e.target.value as any)} className="p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs">
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input value={newSmLink} onChange={e => setNewSmLink(e.target.value)} placeholder="https://..." className="flex-1 p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs" />
          <button onClick={handleAddSocialMedia} className="px-4 py-2 min-h-[44px] bg-[#2C221E] text-white text-xs font-bold rounded-full cursor-pointer hover:bg-[#3D2F2A] flex items-center gap-1"><PlusCircle className="w-3.5 h-3.5" /> Add</button>
        </div>
      </div>
    </div>
  );
}

// ── QR Generator Sub-Component ──
function QrGenerator() {
  const [baseUrl, setBaseUrl] = useState(window.location.origin + '/?book=true');
  const bookingUrl = baseUrl.includes('book=true') ? baseUrl : baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'book=true';
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-2xs space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#2C221E]">QR Code for Booking</h3>
        <p className="text-xs text-[#68584E]">
          Print this QR and display at your salon. Customers scan it with their phone camera, log in, and book an appointment directly.
        </p>

        <div>
          <label className="block text-xs font-bold text-[#2C221E] mb-1">Booking URL</label>
          <input
            value={bookingUrl}
            onChange={e => setBaseUrl(e.target.value)}
            className="w-full p-2.5 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE] text-xs font-mono"
          />
        </div>

        <div className="flex justify-center bg-white p-6 rounded-2xl border border-[#E3D8CE] relative">
          <img src={qrSrc} alt="QR Code for booking" className="w-64 h-64" />
        </div>

        <button
          onClick={async () => {
            const resp = await fetch(qrSrc);
            const blob = await resp.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'monikazz-salon-academy-qr.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}
          className="w-full bg-[#2C221E] hover:bg-[#4A3933] text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span>⬇</span>
          <span>Download QR Code</span>
        </button>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
          <p className="font-bold mb-1">How it works:</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-700">
            <li>Customer scans QR with phone camera</li>
            <li>They are asked to login (or sign up)</li>
            <li>After login, booking form opens automatically</li>
            <li>They pick service, staff, date & time</li>
            <li>Booking is confirmed and shows in their list</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

// ── Price History Sub-Component ──
function PriceHistoryView() {
  const [history, setHistory] = useState<import('../types').PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  React.useEffect(() => {
    fetch('/api/price-history').then(r => r.json()).then(d => { setHistory(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);
  if (loading) return <p className="text-xs text-stone-500 italic">Loading price history...</p>;
  if (history.length === 0) return <p className="text-xs text-stone-500 italic">No price changes recorded yet.</p>;
  return (
    <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs">
      {history.slice(0, 50).map(h => (
        <div key={h.id} className="flex items-center justify-between gap-2 p-2 bg-white rounded-xl border border-[#E3D8CE]">
          <span className="font-bold text-[#2C221E] truncate">{h.service_id}</span>
          <span>₹{h.price}</span>
          {h.discount_percent > 0 && <span className="text-emerald-600 font-bold">{h.discount_percent}% OFF</span>}
          <span className="text-[#A87B51] font-bold">₹{h.after_discount}</span>
          <span className="text-stone-400 whitespace-nowrap">{new Date(h.changed_at).toLocaleDateString()}</span>
        </div>
      ))}
    </div>
  );
}
