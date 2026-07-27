import React from 'react';
import { Sparkles, Calendar, User, ShieldCheck, Bell, Scissors, Database, RefreshCw } from 'lucide-react';
import { UserRole, Profile } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'services' | 'staff' | 'bookings' | 'admin';
  setActiveTab: (tab: 'services' | 'staff' | 'bookings' | 'admin') => void;
  onOpenBooking: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isConnected: boolean;
  onOpenSupabaseModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  onOpenBooking,
  unreadCount,
  onOpenNotifications,
  isConnected,
  onOpenSupabaseModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F3]/90 backdrop-blur-md border-b border-[#E8DFD8] shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#2C221E] text-[#F3E8E1] px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span>Welcome to Monikaz Parlour — Book online for 15% off first 24K Gold Facial!</span>
        <button
          onClick={onOpenBooking}
          className="underline text-[#E5C380] hover:text-white ml-2 transition-colors cursor-pointer"
        >
          Book Now
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('services')}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2C221E] to-[#4A3933] flex items-center justify-center text-[#D4AF37] shadow-md border border-[#D4AF37]/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-[#2C221E] block leading-none">
                Monikaz <span className="italic font-normal text-[#A87B51]">Parlour</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#8A7568] font-medium block mt-1">
                Haute Beauty & Spa
              </span>
            </div>
          </div>

          {/* Nav Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-[#F2ECE6] p-1.5 rounded-full border border-[#E3D8CE]">
            <button
              onClick={() => setActiveTab('services')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              Services & Menu
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              Stylists & Staff
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>
            {currentRole === 'admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'admin'
                    ? 'bg-[#8C6D58] text-white shadow-xs'
                    : 'text-[#8C6D58] hover:bg-[#EAE1D8]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            )}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-3">
            {/* Realtime Status Indicator */}
            <button
              onClick={onOpenSupabaseModal}
              title="Database & Realtime Status - Click to manage Supabase settings"
              className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2ECE6] border border-[#E3D8CE] text-xs text-[#52433A] hover:bg-[#EAE2D9] transition-colors cursor-pointer"
            >
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-[#8A7568]" />
              <span className="font-medium">{isConnected ? 'Realtime Connected' : 'Local / Offline DB'}</span>
            </button>

            {/* Role Switcher Badge */}
            <div className="flex items-center bg-[#F2ECE6] p-1 rounded-full border border-[#E3D8CE]">
              <button
                onClick={() => onRoleChange('customer')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  currentRole === 'customer'
                    ? 'bg-white text-[#2C221E] shadow-xs'
                    : 'text-[#8A7568] hover:text-[#2C221E]'
                }`}
              >
                <User className="w-3 h-3" />
                <span className="hidden sm:inline">Customer</span>
              </button>
              <button
                onClick={() => onRoleChange('admin')}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                  currentRole === 'admin'
                    ? 'bg-[#8C6D58] text-white shadow-xs'
                    : 'text-[#8A7568] hover:text-[#2C221E]'
                }`}
              >
                <ShieldCheck className="w-3 h-3" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2.5 rounded-full bg-white border border-[#E3D8CE] text-[#52433A] hover:bg-[#F7F2ED] transition-colors cursor-pointer shadow-xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C59B27] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Booking Button */}
            <button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-[#2C221E] to-[#4A3933] hover:from-[#3D2F2A] hover:to-[#5B4840] text-white font-medium text-sm px-5 py-2.5 rounded-full shadow-md transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 border border-[#D4AF37]/20"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden">Book</span>
            </button>
          </div>

        </div>

        {/* Mobile Tab Strip with Touch Targets & Icons */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-[#E8DFD8] bg-[#FAF6F3]">
          <button
            onClick={() => setActiveTab('services')}
            className={`text-xs font-semibold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'services' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>
          <button
            onClick={() => setActiveTab('staff')}
            className={`text-xs font-semibold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Stylists</span>
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`text-xs font-semibold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'bookings' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bookings</span>
          </button>
          {currentRole === 'admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`text-xs font-semibold py-2 px-3.5 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
                activeTab === 'admin' ? 'bg-[#8C6D58] text-white shadow-xs' : 'text-[#8C6D58] hover:bg-[#F2ECE6]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
