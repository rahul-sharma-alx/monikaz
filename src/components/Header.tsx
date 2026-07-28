import React, { useState } from 'react';
import { Sparkles, Calendar, User, ShieldCheck, Bell, Scissors, Database, Menu, X, LogIn, ChevronDown } from 'lucide-react';
import { UserRole, Profile, Shop } from '../types';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about';
  setActiveTab: (tab: 'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about') => void;
  onOpenBooking: () => void;
  unreadCount: number;
  onOpenNotifications: () => void;
  isConnected: boolean;
  onOpenSupabaseModal: () => void;
  currentUser: Profile | null;
  onOpenAuthModal: () => void;
  shop?: Shop | null;
  bestOffer?: string;
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
  onOpenSupabaseModal,
  currentUser,
  onOpenAuthModal,
  shop,
  bestOffer,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (tab: 'services' | 'staff' | 'bookings' | 'admin' | 'contact' | 'about') => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF6F3]/95 backdrop-blur-md border-b border-[#E8DFD8] shadow-xs">
      {/* Top Announcement Bar */}
      <div className="bg-[#2C221E] text-[#F3E8E1] px-4 py-1.5 text-xs text-center flex items-center justify-center gap-2 font-medium">
        <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] animate-pulse" />
        <span>{bestOffer || 'Welcome to Monikazz Salon & Academy — Special offer: 15% off on 24K Gold Facial! Book now!'}</span>
        <button
          onClick={onOpenBooking}
          className="underline text-[#E5C380] hover:text-white ml-2 transition-colors cursor-pointer"
        >
          Book Now
        </button>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNavClick('services')}>
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#2C221E] to-[#4A3933] flex items-center justify-center text-[#D4AF37] shadow-md border border-[#D4AF37]/30 overflow-hidden">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Scissors className="w-5 h-5" />
              )}
            </div>
            <div>
<span className="font-serif text-2xl font-bold tracking-tight text-[#2C221E] block leading-none">
  {shop?.name || 'Monikazz'}
  <span className="hidden sm:inline italic font-normal text-[#A87B51]"> Salon & Academy</span>
</span>
              <span className="text-[10px] tracking-widest uppercase text-[#8A7568] font-medium block mt-1">
                Premium Beauty & Spa Salon
              </span>
            </div>
          </div>

          {/* Desktop Nav Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F2ECE6] p-1.5 rounded-full border border-[#E3D8CE]">
            <button
              onClick={() => handleNavClick('services')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'services'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              Services & Menu
            </button>
            <button
              onClick={() => handleNavClick('staff')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'staff'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              Stylists & Staff
            </button>
            <button
              onClick={() => handleNavClick('bookings')}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'bookings'
                  ? 'bg-[#2C221E] text-white shadow-xs'
                  : 'text-[#615147] hover:text-[#2C221E]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>My Bookings</span>
            </button>
            {currentRole !== 'customer' && (
              <button
                onClick={() => handleNavClick('admin')}
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
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Realtime Status Indicator */}
            {/* <button
              onClick={onOpenSupabaseModal}
              title="Database & Realtime Status"
              className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2ECE6] border border-[#E3D8CE] text-xs text-[#52433A] hover:bg-[#EAE2D9] transition-colors cursor-pointer"
            > */}
              {/* <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <Database className="w-3.5 h-3.5 text-[#8A7568]" />
              <span className="font-medium">{isConnected ? 'Realtime Connected' : 'Local DB'}</span>
            </button> */}

            {/* User Profile / Auth Trigger (Desktop only) */}
            <button
              onClick={onOpenAuthModal}
              className="hidden lg:flex items-center gap-2 p-1.5 px-3.5 py-2 rounded-full bg-white border border-[#E3D8CE] hover:border-[#A87B51] text-[#2C221E] text-xs font-semibold transition-all cursor-pointer shadow-2xs min-h-[44px]"
            >
              {currentUser ? (
                <>
                  <img
                    src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                    alt={currentUser.full_name}
                    referrerPolicy="no-referrer"
                    className="w-7 h-7 rounded-full object-cover border border-[#2C221E]"
                  />
                  <div className="text-left leading-tight">
                    <span className="block font-bold text-[#2C221E] truncate max-w-[100px]">{currentUser.full_name.split(' ')[0]}</span>
                    <span className="block text-[10px] text-[#A87B51] font-normal capitalize">{currentUser.role}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-[#FAF6F3] flex items-center justify-center text-[#2C221E]">
                    <LogIn className="w-4 h-4 text-[#A87B51]" />
                  </div>
                  <span className="font-bold">Sign In</span>
                </>
              )}
            </button>

            {/* Notification Bell (Desktop only) */}
            <button
              onClick={onOpenNotifications}
              className="hidden lg:flex relative p-2.5 rounded-full bg-white border border-[#E3D8CE] text-[#52433A] hover:bg-[#F7F2ED] transition-colors cursor-pointer shadow-xs min-h-[44px] min-w-[44px] items-center justify-center"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C59B27] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Quick Booking Button — hidden for admin role */}
            {currentRole !== 'admin' && (
            <button
              onClick={onOpenBooking}
              className="bg-gradient-to-r from-[#2C221E] to-[#4A3933] hover:from-[#3D2F2A] hover:to-[#5B4840] text-white font-medium text-xs sm:text-sm px-4 sm:px-5 py-2.5 rounded-full shadow-md transition-all cursor-pointer flex items-center gap-1.5 border border-[#D4AF37]/20 min-h-[44px]"
            >
              <Sparkles className="w-4 h-4 text-[#D4AF37]" />
              <span className="hidden sm:inline">Book Appointment</span>
              <span className="sm:hidden font-bold">Book</span>
            </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-full bg-[#F2ECE6] border border-[#E3D8CE] text-[#2C221E] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 px-3 border-t border-[#E8DFD8] bg-[#FAF6F3] space-y-3.5 animate-in slide-in-from-top duration-200">
            
            {/* Mobile Profile & Notifications Card */}
            <div className="bg-white p-3.5 rounded-2xl border border-[#E3D8CE] shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                {/* User Profile Info / Trigger */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal();
                  }}
                  className="flex items-center gap-3 text-left cursor-pointer group"
                >
                  {currentUser ? (
                    <>
                      <img
                        src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                        alt={currentUser.full_name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#2C221E] shrink-0"
                      />
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#2C221E] group-hover:text-[#A87B51] transition-colors">{currentUser.full_name}</h4>
                        <p className="text-[11px] text-[#8A7568] flex items-center gap-1">
                          <span className="capitalize">{currentUser.role}</span> • <span className="text-[#A87B51] font-bold underline">Account Details</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] flex items-center justify-center text-[#2C221E] shrink-0">
                        <LogIn className="w-4 h-4 text-[#A87B51]" />
                      </div>
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#2C221E] group-hover:text-[#A87B51]">Sign In / Register</h4>
                        <p className="text-[11px] text-[#8A7568]">Manage profile & bookings</p>
                      </div>
                    </div>
                  )}
                </button>

                {/* Notification Bell in Mobile Menu */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenNotifications();
                  }}
                  className="relative p-2.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F2ECE6] border border-[#E3D8CE] text-[#52433A] cursor-pointer transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                  title="Notifications"
                >
                  <Bell className="w-4.5 h-4.5 text-[#2C221E]" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#C59B27] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleNavClick('services')}
                className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'services' ? 'bg-[#2C221E] text-white' : 'bg-white text-[#2C221E] border border-[#E3D8CE] hover:border-[#A87B51]'
                }`}
              >
                <Scissors className="w-4 h-4 text-[#D4AF37]" />
                <span>Services Menu</span>
              </button>

              <button
                onClick={() => handleNavClick('staff')}
                className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'staff' ? 'bg-[#2C221E] text-white' : 'bg-white text-[#2C221E] border border-[#E3D8CE] hover:border-[#A87B51]'
                }`}
              >
                <User className="w-4 h-4 text-[#D4AF37]" />
                <span>Stylists & Staff</span>
              </button>

              <button
                onClick={() => handleNavClick('bookings')}
                className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'bookings' ? 'bg-[#2C221E] text-white' : 'bg-white text-[#2C221E] border border-[#E3D8CE] hover:border-[#A87B51]'
                }`}
              >
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>My Appointments</span>
              </button>

              <button
                onClick={() => handleNavClick('admin')}
                className={`p-3 rounded-2xl text-xs font-bold text-left flex items-center gap-2 cursor-pointer transition-colors ${
                  activeTab === 'admin' ? 'bg-[#8C6D58] text-white' : 'bg-white text-[#8C6D58] border border-[#E3D8CE] hover:border-[#A87B51]'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Admin Portal</span>
              </button>
            </div>

            {/* Role Switch & Database Status Footer */}
            <div className="pt-2 border-t border-[#E3D8CE] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-[#8A7568] font-medium">Role:</span>
                <button
                  onClick={() => onRoleChange(currentRole === 'customer' ? 'admin' : 'customer')}
                  className="px-3 py-1.5 rounded-full bg-white border border-[#E3D8CE] text-[#2C221E] font-bold cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <span className="capitalize">{currentRole}</span>
                  <ChevronDown className="w-3 h-3 text-[#A87B51]" />
                </button>
              </div>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenSupabaseModal();
                }}
                className="flex items-center gap-1.5 text-[11px] text-[#52433A] font-semibold bg-white px-2.5 py-1.5 rounded-full border border-[#E3D8CE] cursor-pointer"
              >
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <Database className="w-3 h-3 text-[#8A7568]" />
                <span>{isConnected ? 'Realtime Connected' : 'Local DB'}</span>
              </button>
            </div>

          </div>
        )}

        {/* Mobile Fixed Quick-Tab Strip */}
        <div className="flex lg:hidden items-center justify-around py-2 border-t border-[#E8DFD8] bg-[#FAF6F3]">
          <button
            onClick={() => handleNavClick('services')}
            className={`text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'services' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Services</span>
          </button>

          <button
            onClick={() => handleNavClick('staff')}
            className={`text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'staff' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Stylists</span>
          </button>

          <button
            onClick={() => handleNavClick('bookings')}
            className={`text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
              activeTab === 'bookings' ? 'bg-[#2C221E] text-white shadow-xs' : 'text-[#615147] hover:bg-[#F2ECE6]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Bookings</span>
          </button>

          {currentRole !== 'customer' && (
            <button
              onClick={() => handleNavClick('admin')}
              className={`text-xs font-semibold py-2 px-3 rounded-full flex items-center gap-1.5 transition-colors min-h-[44px] cursor-pointer ${
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

