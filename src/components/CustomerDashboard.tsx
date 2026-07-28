import React, { useState } from 'react';
import { Booking, Review } from '../types';
import { Calendar, Clock, Sparkles, CheckCircle2, AlertCircle, Star, XCircle, RefreshCw, Mail } from 'lucide-react';

interface CustomerDashboardProps {
  bookings: Booking[];
  reviews: Review[];
  onCancelBooking: (bookingId: string) => Promise<void>;
  onOpenReviewModal: (booking: Booking) => void;
  emailLogs: any[];
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  bookings,
  reviews,
  onCancelBooking,
  onOpenReviewModal,
  emailLogs,
}) => {
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [activeTab, setActiveTab] = useState<'bookings' | 'emails'>('bookings');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Filter Bookings
  const filteredBookings = bookings.filter(b => {
    if (filter === 'upcoming') {
      return b.status === 'pending' || b.status === 'confirmed' || b.status === 'in_progress';
    }
    if (filter === 'completed') {
      return b.status === 'completed';
    }
    if (filter === 'cancelled') {
      return b.status === 'cancelled' || b.status === 'no_show';
    }
    return true;
  });

  // Check 3-hour cancellation cutoff rule
  const isCutoffExceeded = (bookingDate: string, startTime: string): boolean => {
    try {
      const appointmentTime = new Date(`${bookingDate}T${startTime}:00`);
      const now = new Date();
      const diffInHours = (appointmentTime.getTime() - now.getTime()) / (1000 * 3600);
      return diffInHours < 3;
    } catch {
      return false;
    }
  };

  const handleCancel = async (booking: Booking) => {
    if (isCutoffExceeded(booking.booking_date, booking.start_time)) {
      setActionMessage({
        type: 'error',
        text: 'Cancellations within 3 hours of appointment time cannot be performed online. Please call Monikazz Salon & Academy desk at +1 (555) 999-0000.'
      });
      return;
    }

    if (!confirm(`Are you sure you wish to cancel your appointment for "${booking.service_name}" on ${booking.booking_date}?`)) {
      return;
    }

    setActionLoadingId(booking.id);
    setActionMessage(null);
    try {
      await onCancelBooking(booking.id);
      setActionMessage({
        type: 'success',
        text: 'Your appointment has been successfully cancelled.'
      });
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || 'Failed to cancel booking.'
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
          </span>
        );
      case 'in_progress':
        return (
          <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold flex items-center gap-1 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> In Progress
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-300 text-xs font-bold flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Pending Confirmation
          </span>
        );
    }
  };

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#A87B51] font-bold">My Account</span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C221E] mt-0.5">My Appointments</h2>
          <p className="text-xs text-[#8A7568] mt-1">
            View your upcoming bookings, check status, or rate completed services.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#FAF6F3] p-1 rounded-full border border-[#E3D8CE] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'bookings' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#8A7568]'
            }`}
          >
            Appointments ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'emails' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#8A7568]'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email Logs ({emailLogs.length})</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div
          className={`mb-6 p-4 rounded-2xl border text-xs flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

      {/* BOOKINGS TAB */}
      {activeTab === 'bookings' && (
        <div>
          {/* Sub Filters */}
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {(['upcoming', 'completed', 'cancelled', 'all'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-[#2C221E] text-white'
                    : 'bg-white text-[#68584E] border border-[#E3D8CE] hover:border-[#A87B51]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-16 bg-[#FAF6F3] rounded-3xl border border-dashed border-[#D9CCC0]">
              <Calendar className="w-10 h-10 text-[#A87B51] mx-auto mb-2 opacity-60" />
              <p className="font-serif text-lg font-bold text-[#2C221E]">No appointments found</p>
              <p className="text-xs text-[#8A7568] mt-1">Book a service to see your appointments here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((bk) => {
                const existingRev = reviews.find(r => r.booking_id === bk.id);

                return (
                  <div
                    key={bk.id}
                    className="bg-white rounded-3xl p-6 border border-[#E3D8CE] shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    {/* Left Info */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        {getStatusBadge(bk.status)}
                        <span className="text-xs font-mono text-stone-400">ID: #{bk.id}</span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#2C221E]">{bk.service_name}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#68584E]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#A87B51]" />
                          <strong>{bk.booking_date}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-[#A87B51]" />
                          <strong>{bk.start_time} — {bk.end_time}</strong> ({bk.service_duration} mins)
                        </span>
                        <span className="text-[#8A7568]">
                          Stylist: <strong>{bk.staff_name}</strong>
                        </span>
                      </div>

                      {bk.notes && (
                        <p className="text-xs text-[#52433A] bg-[#FAF6F3] p-2.5 rounded-xl border border-[#E8DFD8]">
                          Note: "{bk.notes}"
                        </p>
                      )}
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#F2ECE6]">
                      <span className="font-serif text-2xl font-bold text-[#2C221E]">₹{bk.service_price}</span>

                      <div className="flex items-center gap-2">
                        {/* Cancellation Button for Pending / Confirmed */}
                        {(bk.status === 'pending' || bk.status === 'confirmed') && (
                          <button
                            disabled={actionLoadingId === bk.id}
                            onClick={() => handleCancel(bk)}
                            className="px-4 py-2 min-h-[44px] rounded-full border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
                          >
                            {actionLoadingId === bk.id ? 'Cancelling...' : 'Cancel Appointment'}
                          </button>
                        )}

                        {/* Review Button for Completed */}
                        {bk.status === 'completed' && (
                          existingRev ? (
                            <div className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 flex items-center gap-1 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Rated {existingRev.rating}★</span>
                            </div>
                          ) : (
                            <button
                              onClick={() => onOpenReviewModal(bk)}
                              className="px-4 py-2.5 min-h-[44px] rounded-full bg-[#2C221E] hover:bg-[#4A3933] text-white text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                            >
                              <Star className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
                              <span>Leave Review</span>
                            </button>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* EMAIL LOGS TAB */}
      {activeTab === 'emails' && (
        <div className="bg-white rounded-3xl p-6 border border-[#E3D8CE] space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#2C221E]">Simulated Confirmation Email Logs</h3>
          <p className="text-xs text-[#8A7568]">
            Out-of-the-box system logs for email confirmations sent upon booking creation or status updates. Ready for Resend / Supabase Auth integration.
          </p>

          <div className="space-y-3">
            {emailLogs.length === 0 ? (
              <p className="text-xs text-stone-400 italic">No email logs captured yet.</p>
            ) : (
              emailLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-[#2C221E]">
                    <span>To: {log.to}</span>
                    <span className="text-[10px] text-stone-400 font-normal">{new Date(log.sent_at).toLocaleTimeString()}</span>
                  </div>
                  <p className="font-semibold text-[#A87B51]">{log.subject}</p>
                  <p className="text-[#52433A] whitespace-pre-line mt-2">{log.body}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </section>
  );
};
