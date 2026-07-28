import React from 'react';
import { Scissors, MapPin, Phone, Mail, Clock, Instagram, Facebook, Heart, MessageCircle } from 'lucide-react';
import { Shop, Address, SocialMedia } from '../types';

interface FooterProps {
  shop: Shop | null;
  addresses: Address[];
  socialMedia: SocialMedia[];
  onNavigate?: (tab: 'about' | 'contact') => void;
}

export const Footer: React.FC<FooterProps> = ({ shop, addresses, socialMedia, onNavigate }) => {
  const instagram = socialMedia.find(s => s.media_name === 'instagram');
  const facebook = socialMedia.find(s => s.media_name === 'facebook');
  const whatsapp = socialMedia.find(s => s.media_name === 'whatsapp');
  return (
    <footer className="bg-[#2C221E] text-[#F3E8E1] pt-16 pb-12 border-t border-[#4A3933]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A3933] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30">
              {shop?.logo_url ? (
                <img src={shop.logo_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Scissors className="w-5 h-5" />
              )}
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                Monikazz <span className="font-normal italic">Salon & Academy</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#A8988D] block mt-1">
                Premium Beauty & Spa Salon
              </span>
            </div>
          </div>

          <p className="text-xs text-[#C5B7AE] leading-relaxed">
            Your trusted salon for hair styling, gold facial therapy, gel manicure, bridal makeup and body massage treatments.
          </p>

          <div className="flex items-center gap-3 text-[#E5C380]">
            {whatsapp && (
              <a href={whatsapp.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-[#4A3933] hover:bg-green-600 hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            {instagram && (
              <a href={instagram.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-[#4A3933] hover:bg-[#A87B51] hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Instagram className="w-4 h-4" />
              </a>
            )}
            {facebook && (
              <a href={facebook.link} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded-full bg-[#4A3933] hover:bg-[#A87B51] hover:text-white transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center">
                <Facebook className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Opening Hours */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Opening Hours</span>
          </h4>
          <ul className="text-xs text-[#C5B7AE] space-y-2">
            <li className="flex items-center justify-between">
              <span>Monday — Saturday:</span>
              <span className="font-bold text-white">10:00 AM – 8:00 PM</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Sunday:</span>
              <span className="font-bold text-white">10:00 AM – 6:00 PM</span>
            </li>
          </ul>
        </div>

        {/* Location & Contact */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#D4AF37]" />
            <span>Visit Us</span>
          </h4>
          <ul className="text-xs text-[#C5B7AE] space-y-2.5">
            {addresses.map(a => (
              <li key={a.id} className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-[#A8988D] shrink-0 mt-0.5" />
                <span>{a.address}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Service Guarantees */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-white">Why Choose Us</h4>
          <div className="bg-[#3D2F2A] p-4 rounded-2xl border border-[#52413A] text-xs text-[#C5B7AE] space-y-2">
            <p className="font-semibold text-[#E5C380]">✔ 100% Organic & Hygienic Products</p>
            <p className="font-semibold text-[#E5C380]">✔ Trained & Experienced Staff</p>
            <p className="font-semibold text-[#E5C380]">✔ Clean & Sanitised Salon</p>
          </div>
        </div>

      </div>

      {/* Quick Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 flex flex-wrap items-center justify-center gap-4 text-xs">
        {onNavigate && (
          <>
            <button onClick={() => onNavigate('about')} className="text-[#C5B7AE] hover:text-white transition-colors cursor-pointer">About Us</button>
            <span className="text-[#4A3933]">|</span>
            <button onClick={() => onNavigate('contact')} className="text-[#C5B7AE] hover:text-white transition-colors cursor-pointer">Contact Us</button>
            <span className="text-[#4A3933]">|</span>
          </>
        )}
        <a href="#" className="text-[#C5B7AE] hover:text-white transition-colors">Privacy Policy</a>
        <span className="text-[#4A3933]">|</span>
        <a href="#" className="text-[#C5B7AE] hover:text-white transition-colors">Terms of Service</a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-6 border-t border-[#3D2F2A] text-center text-xs text-[#A8988D] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Monikazz Salon & Academy. All rights reserved.</p>
        <p className="flex items-center justify-center gap-1">
          <span>Made with love for your beauty</span>
          <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
        </p>
      </div>
    </footer>
  );
};
