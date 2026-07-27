import React, { useState } from 'react';
import { Profile } from '../types';
import { User, Save, Camera, Lock, X, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Profile | null;
  onUpdateProfile: (profile: Profile) => void;
}

const STOCK_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&q=80&w=300',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, currentUser, onUpdateProfile }) => {
  const [name, setName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatar, setAvatar] = useState(currentUser?.avatar_url || STOCK_AVATARS[0]);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen || !currentUser) return null;

  const handleSave = () => {
    if (!name.trim()) { setMessage({ type: 'error', text: 'Name is required.' }); return; }
    const updated: Profile = { ...currentUser, full_name: name.trim(), phone: phone.trim(), avatar_url: avatar };
    localStorage.setItem('monikaz_user', JSON.stringify(updated));
    if (password.length >= 4) localStorage.setItem('monikaz_password', password);
    onUpdateProfile(updated);
    setMessage({ type: 'success', text: 'Profile updated!' });
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-[#E3D8CE] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
        <div className="shrink-0 flex items-center justify-between p-5 pb-3 border-b border-[#E3D8CE]">
          <h3 className="font-serif text-xl font-bold text-[#2C221E]">Edit Profile</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-[#FAF6F3] flex items-center justify-center text-stone-500 hover:text-[#2C221E] cursor-pointer">✕</button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5 text-xs">
          {message && (
            <div className={`flex items-center gap-2 p-3 rounded-2xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {message.text}
            </div>
          )}

          <div>
            <label className="block font-bold text-[#2C221E] mb-2">Profile Picture</label>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#D4AF37] shrink-0 bg-stone-100">
                <img src={avatar} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <input type="text" value={avatar} onChange={e => setAvatar(e.target.value)} placeholder="Avatar URL" className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]" />
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {STOCK_AVATARS.map(url => (
                <button key={url} onClick={() => setAvatar(url)} className={`w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 cursor-pointer ${avatar === url ? 'border-[#D4AF37]' : 'border-transparent hover:border-stone-300'}`}>
                  <img src={url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-[#2C221E] mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]" />
          </div>

          <div>
            <label className="block font-bold text-[#2C221E] mb-1">Email</label>
            <input type="email" value={currentUser.email} disabled className="w-full p-2 bg-stone-100 rounded-xl border border-[#E3D8CE] text-stone-400 cursor-not-allowed" />
          </div>

          <div>
            <label className="block font-bold text-[#2C221E] mb-1">Phone</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]" />
          </div>

          <div className="border-t border-[#E3D8CE] pt-4">
            <label className="block font-bold text-[#2C221E] mb-1 flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-[#A87B51]" /> Change Password (min 4 chars)</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full p-2 bg-[#FAF6F3] rounded-xl border border-[#E3D8CE]" />
          </div>
        </div>

        <div className="shrink-0 flex items-center justify-end gap-2 p-5 pt-3 border-t border-[#E3D8CE]">
          <button onClick={onClose} className="px-4 py-2 min-h-[44px] text-xs font-bold text-stone-500 hover:text-[#2C221E] cursor-pointer">Cancel</button>
          <button onClick={handleSave} className="px-5 py-2 min-h-[44px] bg-[#2C221E] hover:bg-[#3D2F2A] text-white text-xs font-bold rounded-full cursor-pointer flex items-center gap-1.5"><Save className="w-3.5 h-3.5" /> Save Changes</button>
        </div>
      </div>
    </div>
  );
};
