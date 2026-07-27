import React, { useEffect } from 'react';
import { Sparkles, Bell, X, CheckCircle2 } from 'lucide-react';
import { Notification } from '../types';

interface NotificationToastProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notifications,
  onDismiss,
}) => {
  const activeUnread = notifications.filter(n => !n.read).slice(0, 3);

  if (activeUnread.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {activeUnread.map((notif) => (
        <div
          key={notif.id}
          className="pointer-events-auto bg-[#2C221E] text-white p-4 rounded-2xl border border-[#D4AF37]/40 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>

          <div className="flex-1 space-y-0.5">
            <p className="text-xs font-bold text-[#E5C380]">{notif.title}</p>
            <p className="text-xs text-stone-200 leading-snug">{notif.message}</p>
            <span className="text-[10px] text-stone-400 block pt-1">
              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <button
            onClick={() => onDismiss(notif.id)}
            className="text-stone-400 hover:text-white p-1 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
