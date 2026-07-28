import React, { useState, useMemo } from 'react';
import { Service, Staff, Booking, Profile, Shop, SocialMedia, Address } from '../types';
import { Calendar as CalendarIcon, Clock, User, CheckCircle, AlertCircle, Sparkles, ChevronRight, ArrowLeft, Phone, MapPin, MessageCircle } from 'lucide-react';
import { getTodayString } from '../data/initialData';

interface BookingFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: Service[];
  staffList: Staff[];
  existingBookings: Booking[];
  preselectedService?: Service | null;
  preselectedStaff?: Staff | null;
  currentUser?: Profile | null;
  onBookingSubmitted: (bookingData: Partial<Booking>) => Promise<void>;
  shop?: Shop | null;
  socialMedia?: SocialMedia[];
  addresses?: Address[];
}

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00', '12:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00'
];

function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minsToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export const BookingFlowModal: React.FC<BookingFlowModalProps> = ({
  isOpen,
  onClose,
  services,
  staffList,
  existingBookings,
  preselectedService,
  preselectedStaff,
  currentUser,
  onBookingSubmitted,
  shop,
  socialMedia,
  addresses,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [selectedService, setSelectedService] = useState<Service | null>(
    preselectedService || (services.length > 0 ? services[0] : null)
  );
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(
    preselectedStaff || null
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString(0));
  const [selectedStartTime, setSelectedStartTime] = useState<string>('11:00');

  // Customer Contact State
  const [customerName, setCustomerName] = useState<string>('Sophia Williams');
  const [customerPhone, setCustomerPhone] = useState<string>('+1 (555) 234-5678');
  const [customerEmail, setCustomerEmail] = useState<string>('sophia.w@example.com');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calculate End Time
  const calculatedEndTime = useMemo(() => {
    if (!selectedService || !selectedStartTime) return '12:00';
    const startMins = timeToMins(selectedStartTime);
    const endMins = startMins + selectedService.duration_minutes;
    return minsToTime(endMins);
  }, [selectedService, selectedStartTime]);

  // Check Slot Availability for Selected Staff & Date
  const isSlotBooked = (timeSlot: string) => {
    if (!selectedService) return false;
    const startMins = timeToMins(timeSlot);
    const endMins = startMins + selectedService.duration_minutes;

    const activeStaff = staffList.filter(s => s.is_active);
    const bookingsOnDate = existingBookings.filter(b =>
      b.booking_date === selectedDate && b.status !== 'cancelled' && b.status !== 'no_show'
    );

    if (selectedStaff) {
      // Specific staff: check if that staff is booked
      return bookingsOnDate.some(b =>
        b.staff_id === selectedStaff.id &&
        Math.max(startMins, timeToMins(b.start_time)) < Math.min(endMins, timeToMins(b.end_time))
      );
    }

    // "Any Available": block only if ALL staff are booked at this time
    if (activeStaff.length === 0) return false;
    return activeStaff.every(staff =>
      bookingsOnDate.some(b =>
        b.staff_id === staff.id &&
        Math.max(startMins, timeToMins(b.start_time)) < Math.min(endMins, timeToMins(b.end_time))
      )
    );
  };

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1 && !selectedService) {
      setErrorMsg('Please select a service.');
      return;
    }
    if (step === 2 && !selectedStartTime) {
      setErrorMsg('Please select a time slot.');
      return;
    }
    if (step === 3) {
      if (!customerName.trim() || !customerEmail.trim()) {
        setErrorMsg('Please enter your name and email address.');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleSubmitBooking = async () => {
    if (!selectedService) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      await onBookingSubmitted({
        customer_id: currentUser?.id || undefined,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        service_id: selectedService.id,
        service_name: selectedService.name,
        service_price: selectedService.price,
        service_duration: selectedService.duration_minutes,
        staff_id: selectedStaff?.id || undefined,
        staff_name: selectedStaff?.full_name || 'Any Available Stylist',
        booking_date: selectedDate,
        start_time: selectedStartTime,
        end_time: calculatedEndTime,
        notes: notes,
      });

      // Reset and close modal
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to submit booking. Please check availability.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-2xl w-full border border-[#E3D8CE] shadow-2xl flex flex-col max-h-[95dvh] sm:max-h-[85vh] animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header */}
        <div className="bg-[#2C221E] text-white p-4 sm:p-6 relative flex items-center justify-between flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
              Book Your Appointment
            </span>
            <h3 className="font-serif text-2xl font-bold mt-0.5">
              Monikaz Parlour <span className="italic font-normal text-[#D4AF37]">Booking</span>
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Step Indicator Bar */}
        <div className="bg-[#FAF6F3] border-b border-[#E8DFD8] px-4 sm:px-6 py-2 sm:py-3 flex items-center justify-between text-xs font-semibold text-[#8A7568] flex-shrink-0">
          <span className={step >= 1 ? 'text-[#2C221E] font-bold' : ''}>1</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className={step >= 2 ? 'text-[#2C221E] font-bold' : ''}>2</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className={step >= 3 ? 'text-[#2C221E] font-bold' : ''}>3</span>
          <ChevronRight className="w-3 h-3 text-stone-400" />
          <span className={step >= 4 ? 'text-[#2C221E] font-bold' : ''}>4</span>
        </div>

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="mx-4 sm:mx-6 mt-3 p-2.5 sm:p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Modal Content Steps */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
          
          {/* STEP 1: SERVICE & STAFF SELECTION */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                  Select Beauty Service *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-48 overflow-y-auto p-1">
                  {services.filter(s => s.is_active).map((service) => (
                    <div
                      key={service.id}
                      onClick={() => setSelectedService(service)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                        selectedService?.id === service.id
                          ? 'border-[#2C221E] bg-[#FAF6F3] shadow-xs'
                          : 'border-[#E3D8CE] bg-white hover:border-[#A87B51]'
                      }`}
                    >
                      <div className="pr-2">
                        <p className="font-serif text-sm font-bold text-[#2C221E]">{service.name}</p>
                        <p className="text-[11px] text-[#8A7568]">{service.duration_minutes} mins • ₹{service.price}</p>
                      </div>
                      {selectedService?.id === service.id && (
                        <CheckCircle className="w-5 h-5 text-[#2C221E] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-2">
                  Select Preferred Stylist (Optional)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                  <div
                    onClick={() => setSelectedStaff(null)}
                    className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                      selectedStaff === null
                        ? 'border-[#2C221E] bg-[#FAF6F3] font-bold text-[#2C221E]'
                        : 'border-[#E3D8CE] bg-white text-[#68584E] hover:border-[#A87B51]'
                    }`}
                  >
                    <p className="text-xs font-semibold">Any Available</p>
                    <p className="text-[10px] text-[#8A7568]">First available expert</p>
                  </div>

                  {staffList.filter(st => st.is_active).map((staff) => (
                    <div
                      key={staff.id}
                      onClick={() => setSelectedStaff(staff)}
                      className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-2 ${
                        selectedStaff?.id === staff.id
                          ? 'border-[#2C221E] bg-[#FAF6F3] font-bold text-[#2C221E]'
                          : 'border-[#E3D8CE] bg-white text-[#68584E] hover:border-[#A87B51]'
                      }`}
                    >
                      <img
                        src={staff.photo_url}
                        alt={staff.full_name}
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate text-left">
                        <p className="text-xs font-semibold truncate">{staff.full_name}</p>
                        <p className="text-[10px] text-[#8A7568] truncate">★ {staff.rating || 5.0}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & TIME SLOT */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-2 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-[#A87B51]" />
                  Select Date *
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((offset) => {
                    const dateStr = getTodayString(offset);
                    const dateObj = new Date(dateStr + 'T00:00:00');
                    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

                    return (
                      <button
                        key={dateStr}
                        onClick={() => setSelectedDate(dateStr)}
                        className={`px-4 py-3 min-h-[44px] rounded-2xl border text-center transition-all cursor-pointer shrink-0 ${
                          selectedDate === dateStr
                            ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-sm'
                            : 'bg-white border-[#E3D8CE] text-[#52433A] hover:border-[#A87B51]'
                        }`}
                      >
                        <span className="text-[10px] uppercase block tracking-wider opacity-80">{dayName}</span>
                        <span className="text-lg font-bold font-serif block">{dayNum}</span>
                        <span className="text-[10px] block opacity-80">{monthName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#2C221E] mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#A87B51]" />
                  Available Time Slots ({selectedService?.duration_minutes} min service) *
                </label>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-44 overflow-y-auto p-1">
                  {TIME_SLOTS.map((slot) => {
                    const booked = isSlotBooked(slot);
                    return (
                      <button
                        key={slot}
                        disabled={booked}
                        onClick={() => setSelectedStartTime(slot)}
                        className={`py-2.5 px-3 min-h-[44px] rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                          booked
                            ? 'bg-stone-100 text-stone-400 border-stone-200 line-through cursor-not-allowed opacity-60'
                            : selectedStartTime === slot
                            ? 'bg-[#2C221E] text-white border-[#2C221E] shadow-xs'
                            : 'bg-white border-[#E3D8CE] text-[#52433A] hover:border-[#A87B51]'
                        }`}
                      >
                        {slot} {booked ? '(Booked)' : ''}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 p-3 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] text-xs text-[#68584E] flex items-center justify-between">
                  <span>Calculated Appointment Time:</span>
                  <span className="font-bold text-[#2C221E]">
                    {selectedStartTime} — {calculatedEndTime} ({selectedDate})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONTACT & NOTES */}
          {step === 3 && (
            <div className="space-y-4">
              
              {/* Google 1-Click Login Banner */}
              <div className="p-3 bg-[#FAF6F3] rounded-2xl border border-[#E3D8CE] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white border border-[#E3D8CE] flex items-center justify-center shrink-0 shadow-2xs">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h5 className="font-serif text-xs font-bold text-[#2C221E]">Google Quick Login</h5>
                    <p className="text-[10px] text-[#8A7568]">Instant 1-click booking with your Google profile</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerName('Ananya Roy');
                    setCustomerEmail('ananya.roy.google@gmail.com');
                    setCustomerPhone('+91 98765 12345');
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold transition-all cursor-pointer shrink-0"
                >
                  Fill & Book with Google
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Sophia Williams"
                  className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl px-3.5 py-2.5 text-sm text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl px-3.5 py-2.5 text-sm text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">
                    Email Address (For Confirmation) *
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="sophia@example.com"
                    className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl px-3.5 py-2.5 text-sm text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">
                  Special Instructions or Hair/Skin Notes
                </label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Sensitive skin, allergic to almond oil, preparing for wedding..."
                  className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl px-3.5 py-2.5 text-sm text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                />
              </div>
            </div>
          )}

          {/* STEP 4: SUMMARY & CONFIRMATION */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-[#FAF6F3] p-5 rounded-2xl border border-[#E3D8CE] space-y-3">
                <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#A87B51] tracking-wider">Service</span>
                    <h4 className="font-serif text-lg font-bold text-[#2C221E]">{selectedService?.name}</h4>
                  </div>
                  <span className="font-serif text-xl font-bold text-[#2C221E]">₹{selectedService?.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#8A7568] block">Stylist / Therapist:</span>
                    <span className="font-semibold text-[#2C221E]">
                      {selectedStaff ? selectedStaff.full_name : 'Any Available Stylist'}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8A7568] block">Date & Time:</span>
                    <span className="font-semibold text-[#2C221E]">
                      {selectedDate} ({selectedStartTime} - {calculatedEndTime})
                    </span>
                  </div>

                  <div>
                    <span className="text-[#8A7568] block">Customer:</span>
                    <span className="font-semibold text-[#2C221E]">{customerName}</span>
                  </div>

                  <div>
                    <span className="text-[#8A7568] block">Email:</span>
                    <span className="font-semibold text-[#2C221E]">{customerEmail}</span>
                  </div>
                </div>

                {notes && (
                  <div className="pt-2 border-t border-[#E8DFD8] text-xs">
                    <span className="text-[#8A7568] block">Special Instructions:</span>
                    <p className="text-[#52433A] italic">{notes}</p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>An instant confirmation email with your booking code will be sent immediately upon reservation.</span>
              </div>

              {/* Shop Contact */}
              {shop && (
                <div className="bg-white p-4 rounded-2xl border border-[#E3D8CE] space-y-2.5 text-xs">
                  <h5 className="font-serif font-bold text-[#2C221E] text-sm flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#A87B51]" /> {shop.name}
                  </h5>
                  {addresses && addresses.length > 0 && (
                    <p className="text-[#68584E] flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#A87B51] shrink-0 mt-0.5" />
                      <span>{addresses[0].address}</span>
                    </p>
                  )}
                  {socialMedia && socialMedia.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {socialMedia.map(sm => (
                        <a
                          key={sm.id}
                          href={sm.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] font-medium text-[#2C221E] hover:bg-[#E8DFD8] transition-colors"
                        >
                          {sm.media_name === 'whatsapp' && <MessageCircle className="w-3.5 h-3.5 text-green-600" />}
                          {sm.media_name === 'instagram' && <span className="text-pink-600 text-sm">📷</span>}
                          {sm.media_name === 'facebook' && <span className="text-blue-600 text-sm">f</span>}
                          <span className="capitalize">{sm.media_name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-6 bg-[#FAF6F3] border-t border-[#E8DFD8] flex items-center justify-between flex-shrink-0">
          {step > 1 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold text-[#68584E] hover:bg-[#EAE2D9] transition-colors cursor-pointer flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="bg-[#2C221E] hover:bg-[#4A3933] text-white px-6 py-2.5 min-h-[44px] rounded-full text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
            </button>
          ) : (
            <button
              disabled={loading}
              onClick={handleSubmitBooking}
              className="bg-gradient-to-r from-[#2C221E] to-[#4A3933] hover:from-[#3D2F2A] hover:to-[#5B4840] text-white px-8 py-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-md border border-[#D4AF37]/30"
            >
              {loading ? (
                <span>Confirming Appointment...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Confirm Reservation</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
