import React, { useState } from 'react';
import { Service, Staff, Booking, Review, BookingStatus, SupabaseConfig } from '../types';
import {
  TrendingUp, Calendar, Users, Star, DollarSign, Plus, Edit,
  CheckCircle2, XCircle, Clock, Search, Filter, ShieldCheck, Database, Copy, Check
} from 'lucide-react';
import { SUPABASE_SQL_SCHEMA, getTodayString } from '../data/initialData';

interface AdminDashboardProps {
  services: Service[];
  staffList: Staff[];
  bookings: Booking[];
  reviews: Review[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => Promise<void>;
  onCreateService: (service: Partial<Service>) => Promise<void>;
  onUpdateService: (id: string, service: Partial<Service>) => Promise<void>;
  onCreateStaff: (staff: Partial<Staff>) => Promise<void>;
  onUpdateStaff: (id: string, staff: Partial<Staff>) => Promise<void>;
  onRespondToReview: (reviewId: string, response: string) => Promise<void>;
  supabaseConfig: SupabaseConfig;
  onSaveSupabaseCredentials: (url: string, key: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  services,
  staffList,
  bookings,
  reviews,
  onUpdateBookingStatus,
  onCreateService,
  onUpdateService,
  onCreateStaff,
  onUpdateStaff,
  onRespondToReview,
  supabaseConfig,
  onSaveSupabaseCredentials,
}) => {
  const [adminTab, setAdminTab] = useState<'overview' | 'bookings' | 'services' | 'staff' | 'reviews' | 'supabase'>('overview');

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
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800',
    is_active: true
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
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2)
    : '4.95';

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
    if (editingService) {
      await onUpdateService(editingService.id, serviceForm);
    } else {
      await onCreateService(serviceForm);
    }
    setIsServiceModalOpen(false);
    setEditingService(null);
  };

  const handleSaveStaff = async () => {
    if (editingStaff) {
      await onUpdateStaff(editingStaff.id, staffForm);
    } else {
      await onCreateStaff(staffForm);
    }
    setIsStaffModalOpen(false);
    setEditingStaff(null);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      
      {/* Top Admin Banner */}
      <div className="bg-gradient-to-r from-[#2C221E] via-[#4A3933] to-[#2C221E] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D4AF37]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C380] text-xs font-bold uppercase">
            <ShieldCheck className="w-3.5 h-3.5" /> Owner & Admin Command Center
          </div>
          <h1 className="font-serif text-3xl font-bold mt-2">Monikaz Parlour Operations</h1>
          <p className="text-xs text-stone-300 mt-1 max-w-xl">
            Real-time appointment schedule, revenue tracking, service menu editing, staff roster management, and Supabase cloud setup.
          </p>
        </div>

        {/* Quick Nav Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'bookings', label: `Bookings (${bookings.length})` },
            { id: 'services', label: `Services (${services.length})` },
            { id: 'staff', label: `Staff (${staffList.length})` },
            { id: 'reviews', label: `Reviews (${reviews.length})` },
            { id: 'supabase', label: 'Supabase SQL' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as any)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                adminTab === tab.id
                  ? 'bg-[#D4AF37] text-[#2C221E] shadow-sm'
                  : 'bg-white/10 text-stone-200 hover:bg-white/20'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* OVERVIEW TAB */}
      {adminTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A7568] uppercase">Today's Appointments</span>
                <Calendar className="w-5 h-5 text-[#A87B51]" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{todayBookings.length}</p>
              <p className="text-[11px] text-stone-500">Scheduled for {todayStr}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A7568] uppercase">Est. Today's Revenue</span>
                <DollarSign className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">${todayRevenue}</p>
              <p className="text-[11px] text-emerald-600 font-semibold">Active appointments value</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A7568] uppercase">Total Completed</span>
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{completedCount}</p>
              <p className="text-[11px] text-stone-500">Successful parlour sessions</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#E3D8CE] shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#8A7568] uppercase">Average Salon Rating</span>
                <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
              </div>
              <p className="font-serif text-3xl font-bold text-[#2C221E]">{avgRating} ★</p>
              <p className="text-[11px] text-stone-500">From {reviews.length} verified reviews</p>
            </div>
          </div>

          {/* Today's Schedule Quick View */}
          <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">Today's Appointment Schedule</h3>
            {todayBookings.length === 0 ? (
              <p className="text-xs text-stone-500 italic py-4">No appointments scheduled for today.</p>
            ) : (
              <div className="divide-y divide-[#F2ECE6]">
                {todayBookings.map((b) => (
                  <div key={b.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-[#2C221E]">{b.start_time} — {b.end_time}: </span>
                      <span className="font-serif font-bold text-[#A87B51]">{b.service_name}</span>
                      <span className="text-stone-500 ml-2">({b.customer_name})</span>
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
                    <td className="p-3 font-bold text-[#2C221E]">${b.service_price}</td>
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
                    <span className="font-bold text-[#2C221E]">${srv.price}</span>
                  </div>
                  <h4 className="font-serif text-lg font-bold text-[#2C221E] mt-1">{srv.name}</h4>
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
        </div>
      )}

      {/* STAFF MANAGEMENT TAB */}
      {adminTab === 'staff' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">Manage Staff Roster</h3>
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffForm({
                  full_name: '',
                  bio: '',
                  specialties: ['Styling'],
                  photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
                  is_active: true
                });
                setIsStaffModalOpen(true);
              }}
              className="bg-[#2C221E] hover:bg-[#4A3933] text-white px-4 py-2 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {staffList.map((stf) => (
              <div key={stf.id} className="p-5 rounded-2xl border border-[#E3D8CE] bg-[#FAF6F3] space-y-3 flex items-start gap-4">
                <img
                  src={stf.photo_url}
                  alt={stf.full_name}
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-2xl object-cover shrink-0"
                />
                <div className="flex-1 space-y-1 text-xs">
                  <h4 className="font-serif text-lg font-bold text-[#2C221E]">{stf.full_name}</h4>
                  <p className="text-amber-600 font-bold">★ {stf.rating || 5.0} Rating</p>
                  <p className="text-stone-500 line-clamp-2">{stf.bio}</p>
                  <button
                    onClick={() => {
                      setEditingStaff(stf);
                      setStaffForm(stf);
                      setIsStaffModalOpen(true);
                    }}
                    className="text-[#2C221E] font-bold underline cursor-pointer block mt-2"
                  >
                    Edit Staff Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    <span className="font-bold text-[#2C221E] block">Monikaz Parlour Response:</span>
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
                          onClick={async () => {
                            await onRespondToReview(rev.id, responseText);
                            setRespondingReviewId(null);
                            setResponseText('');
                          }}
                          className="px-3 py-1 bg-[#2C221E] text-white rounded-full text-xs font-bold"
                        >
                          Send Response
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setRespondingReviewId(rev.id);
                          setResponseText('');
                        }}
                        className="text-[#2C221E] font-bold underline cursor-pointer"
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

      {/* SERVICE MODAL */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E3D8CE] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h3>

            <div className="space-y-3 text-xs">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2C221E]">Price ($)</label>
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
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setIsServiceModalOpen(false)} className="px-4 py-2 text-xs font-bold text-stone-500">Cancel</button>
              <button onClick={handleSaveService} className="px-5 py-2 bg-[#2C221E] text-white text-xs font-bold rounded-full">Save Service</button>
            </div>
          </div>
        </div>
      )}

      {/* STAFF MODAL */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#E3D8CE] shadow-2xl">
            <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
              {editingStaff ? 'Edit Staff Profile' : 'Add New Staff Member'}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#2C221E]">Full Name</label>
                <input
                  type="text"
                  value={staffForm.full_name}
                  onChange={(e) => setStaffForm({ ...staffForm, full_name: e.target.value })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2C221E]">Bio</label>
                <textarea
                  rows={2}
                  value={staffForm.bio}
                  onChange={(e) => setStaffForm({ ...staffForm, bio: e.target.value })}
                  className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 text-xs font-bold text-stone-500">Cancel</button>
              <button onClick={handleSaveStaff} className="px-5 py-2 bg-[#2C221E] text-white text-xs font-bold rounded-full">Save Staff</button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
