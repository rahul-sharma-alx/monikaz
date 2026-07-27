import React, { useState } from 'react';
import { Profile, UserRole } from '../types';
import { ShieldCheck, User, Mail, Lock, Phone, Sparkles, CheckCircle2, AlertCircle, ArrowRight, LogOut, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  onLogin: (profile: Profile) => void;
  onLogout: () => void;
  requiredRoleForAdmin?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onLogout,
  requiredRoleForAdmin = false,
}) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [role, setRole] = useState<UserRole>('customer');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    setLoading(true);
    setMessage(null);
    setTimeout(() => {
      setLoading(false);
      const googleProfile: Profile = {
        id: `google-user-${Date.now()}`,
        full_name: role === 'admin' ? 'Monika Sharma (Google Verified Admin)' : 'Ananya Roy (Google User)',
        email: role === 'admin' ? 'monika.owner@gmail.com' : 'ananya.roy.google@gmail.com',
        phone: '+91 98765 12345',
        role: role,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        created_at: new Date().toISOString(),
      };
      onLogin(googleProfile);
      setMessage({
        type: 'success',
        text: `Successfully authenticated via Google as ${googleProfile.full_name}!`,
      });
      setTimeout(onClose, 600);
    }, 600);
  };

  const handleDemoCustomerLogin = () => {
    onLogin({
      id: 'user-c1',
      full_name: 'Sophia Williams',
      phone: '+91 98765 43210',
      email: 'sophia.w@example.com',
      role: 'customer',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString(),
    });
    setMessage({ type: 'success', text: 'Logged in as Sophia Williams (Customer)' });
    setTimeout(onClose, 600);
  };

  const handleDemoStaffLogin = () => {
    onLogin({
      id: 'user-s1',
      full_name: 'Elena Rostova (Staff)',
      phone: '+91 98765 22222',
      email: 'elena.r@monikazparlour.com',
      role: 'staff',
      permissions: ['manage_bookings', 'manage_reviews'],
      avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString(),
    });
    setMessage({ type: 'success', text: 'Logged in as Elena Rostova (Staff)' });
    setTimeout(onClose, 600);
  };

  const handleDemoManagerLogin = () => {
    onLogin({
      id: 'user-m1',
      full_name: 'Aisha Patel (Manager)',
      phone: '+91 98765 11111',
      email: 'aisha.p@monikazparlour.com',
      role: 'manager',
      permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews'],
      avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString(),
    });
    setMessage({ type: 'success', text: 'Logged in as Aisha Patel (Parlour Manager)' });
    setTimeout(onClose, 600);
  };

  const handleDemoAdminLogin = () => {
    onLogin({
      id: 'user-a1',
      full_name: 'Monika Sharma (Owner & Admin)',
      phone: '+91 98765 00000',
      email: 'monika@monikazparlour.com',
      role: 'admin',
      permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews', 'manage_permissions'],
      avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
      created_at: new Date().toISOString(),
    });
    setMessage({ type: 'success', text: 'Logged in as Monika Sharma (Owner / Full Admin)' });
    setTimeout(onClose, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address.' });
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
        setMessage({
          type: 'success',
          text: `Password reset instructions have been dispatched to ${email}. Please check your inbox.`,
        });
      }, 800);
      return;
    }

    if (!password || password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (mode === 'signup' && !fullName.trim()) {
      setMessage({ type: 'error', text: 'Please enter your full name.' });
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newProfile: Profile = {
        id: `user-${Date.now()}`,
        full_name: mode === 'signup' ? fullName : (role === 'admin' ? 'Monika Sharma (Owner)' : email.split('@')[0]),
        email: email,
        phone: phone || '+91 98765 00000',
        role: role,
        avatar_url: role === 'admin'
          ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
        created_at: new Date().toISOString(),
      };

      onLogin(newProfile);
      setMessage({
        type: 'success',
        text: mode === 'signup'
          ? 'Account created! Verification link sent to email. Signed in automatically.'
          : `Welcome back, ${newProfile.full_name}!`,
      });
      setTimeout(onClose, 800);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E3D8CE] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 my-8">
        
        {/* Header */}
        <div className="bg-[#2C221E] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            ✕
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#E5C380] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3 h-3" /> Monikaz Beauty Pass
          </div>

          <h3 className="font-serif text-2xl font-bold">
            {requiredRoleForAdmin ? (
              <span className="text-amber-300">Admin Authentication Required</span>
            ) : currentUser ? (
              <span>Your Account Profile</span>
            ) : mode === 'login' ? (
              <span>Welcome Back to Monikaz</span>
            ) : mode === 'signup' ? (
              <span>Create Parlour Account</span>
            ) : (
              <span>Reset Password</span>
            )}
          </h3>

          <p className="text-xs text-stone-300 mt-1">
            {requiredRoleForAdmin
              ? 'Access to salon metrics, bookings management, and service catalog editing requires Admin credentials.'
              : currentUser
              ? `Currently signed in as ${currentUser.full_name} (${currentUser.role.toUpperCase()})`
              : 'Book services, manage appointments, and leave verified ratings.'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Message Banner */}
          {message && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2 ${
                message.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-rose-50 border border-rose-200 text-rose-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span>{message.text}</span>
            </div>
          )}

          {/* Current Logged In View */}
          {currentUser && !requiredRoleForAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE]">
                <img
                  src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300'}
                  alt={currentUser.full_name}
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 rounded-full object-cover border-2 border-[#2C221E] shrink-0"
                />
                <div className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-[#2C221E]">{currentUser.full_name}</h4>
                  <p className="text-xs text-[#8A7568]">{currentUser.email}</p>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#2C221E] text-[#D4AF37]">
                    Role: {currentUser.role}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    onLogout();
                    setMessage({ type: 'success', text: 'You have logged out successfully.' });
                  }}
                  className="w-full py-3 rounded-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Google 1-Click Login Button */}
              {mode !== 'forgot' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={loading}
                    className="w-full bg-white hover:bg-[#FAF6F3] border-2 border-[#E3D8CE] hover:border-[#2C221E] text-[#2C221E] py-3 px-4 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-3 shadow-2xs min-h-[46px]"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{loading ? 'Authenticating with Google...' : 'Continue with Google'}</span>
                  </button>

                  <div className="relative py-1">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3D8CE]" /></div>
                    <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#8A7568] bg-white px-2">
                      Or continue with email / password
                    </div>
                  </div>
                </div>
              )}

              {/* Role Picker */}
              {mode !== 'forgot' && (
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] uppercase tracking-wider mb-2">
                    I am registering/signing in as:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                        role === 'customer'
                          ? 'bg-[#2C221E] text-white border-[#2C221E]'
                          : 'bg-white text-[#68584E] border-[#E3D8CE] hover:border-[#A87B51]'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Customer</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('admin')}
                      className={`py-2.5 px-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-2 min-h-[44px] ${
                        role === 'admin'
                          ? 'bg-[#8C6D58] text-white border-[#8C6D58]'
                          : 'bg-white text-[#68584E] border-[#E3D8CE] hover:border-[#A87B51]'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Admin / Owner</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#8A7568] absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ananya Sharma"
                      className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-[#2C221E] mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A7568] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. name@example.com"
                    className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                  />
                </div>
              </div>

              {/* Phone (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-[#2C221E] mb-1">Mobile Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#8A7568] absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#2C221E]">Password *</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-[11px] font-bold text-[#A87B51] hover:underline cursor-pointer"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#8A7568] absolute left-3.5 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2C221E] hover:bg-[#3D2F2A] text-white py-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
              >
                {loading ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <span>
                      {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
                  </>
                )}
              </button>

              {/* Demo Logins Divider */}
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E3D8CE]" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-[#8A7568] bg-white px-2">
                  Or One-Click Demo Access
                </div>
              </div>

              {/* Demo Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDemoCustomerLogin}
                  className="py-2 px-2.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F2ECE6] border border-[#E3D8CE] text-[#2C221E] text-xs font-semibold cursor-pointer text-left min-h-[44px] flex items-center justify-between"
                >
                  <div>
                    <span className="block font-bold text-[#2C221E]">Customer</span>
                    <span className="block text-[9px] text-[#8A7568]">Sophia W.</span>
                  </div>
                  <User className="w-3.5 h-3.5 text-[#A87B51]" />
                </button>

                <button
                  type="button"
                  onClick={handleDemoStaffLogin}
                  className="py-2 px-2.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F2ECE6] border border-[#E3D8CE] text-[#2C221E] text-xs font-semibold cursor-pointer text-left min-h-[44px] flex items-center justify-between"
                >
                  <div>
                    <span className="block font-bold text-[#2C221E]">Staff Role</span>
                    <span className="block text-[9px] text-[#8A7568]">Elena R.</span>
                  </div>
                  <User className="w-3.5 h-3.5 text-[#A87B51]" />
                </button>

                <button
                  type="button"
                  onClick={handleDemoManagerLogin}
                  className="py-2 px-2.5 rounded-xl bg-[#FAF6F3] hover:bg-[#F2ECE6] border border-[#E3D8CE] text-[#8C6D58] text-xs font-semibold cursor-pointer text-left min-h-[44px] flex items-center justify-between"
                >
                  <div>
                    <span className="block font-bold text-[#8C6D58]">Manager</span>
                    <span className="block text-[9px] text-[#8A7568]">Aisha P.</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8C6D58]" />
                </button>

                <button
                  type="button"
                  onClick={handleDemoAdminLogin}
                  className="py-2 px-2.5 rounded-xl bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-semibold cursor-pointer text-left min-h-[44px] flex items-center justify-between"
                >
                  <div>
                    <span className="block font-bold text-[#D4AF37]">Owner/Admin</span>
                    <span className="block text-[9px] text-stone-300">Monika S.</span>
                  </div>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                </button>
              </div>

              {/* Switch Modes */}
              <div className="text-center pt-2 text-xs text-[#68584E]">
                {mode === 'login' ? (
                  <p>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('signup')}
                      className="font-bold text-[#A87B51] underline cursor-pointer"
                    >
                      Sign Up Now
                    </button>
                  </p>
                ) : (
                  <p>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="font-bold text-[#A87B51] underline cursor-pointer"
                    >
                      Log In
                    </button>
                  </p>
                )}
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
