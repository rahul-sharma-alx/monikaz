import React from 'react';
import { Scissors, MapPin, Phone, Mail, Clock, Instagram, Facebook, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#2C221E] text-[#F3E8E1] pt-16 pb-12 border-t border-[#4A3933]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Column */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#4A3933] flex items-center justify-center text-[#D4AF37] border border-[#D4AF37]/30">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white block leading-none">
                Monikaz <span className="italic font-normal text-[#E5C380]">Parlour</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#A8988D] block mt-1">
                Haute Beauty & Spa
              </span>
            </div>
          </div>

          <p className="text-xs text-[#C5B7AE] leading-relaxed">
            Your sanctuary for haute couture hair styling, 24K gold facial therapy, luxury manicures, and holistic spa treatments.
          </p>

          <div className="flex items-center gap-3 text-[#E5C380]">
            <a href="#instagram" className="p-2 rounded-full bg-[#4A3933] hover:bg-[#A87B51] hover:text-white transition-colors cursor-pointer">
              <Instagram className="w-4 h-4" />
            </a>
            <a href="#facebook" className="p-2 rounded-full bg-[#4A3933] hover:bg-[#A87B51] hover:text-white transition-colors cursor-pointer">
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#D4AF37]" />
            <span>Salon Hours</span>
          </h4>
          <ul className="text-xs text-[#C5B7AE] space-y-2">
            <li className="flex items-center justify-between">
              <span>Monday — Friday:</span>
              <span className="font-bold text-white">10:00 AM – 8:00 PM</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Saturday:</span>
              <span className="font-bold text-white">09:30 AM – 8:30 PM</span>
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
            <span>Visit Our Sanctuary</span>
          </h4>
          <ul className="text-xs text-[#C5B7AE] space-y-2.5">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#A8988D] shrink-0 mt-0.5" />
              <span>450 Grand Avenue, Suite 108, Beverly Hills, CA 90210</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#A8988D] shrink-0" />
              <span>+1 (555) 999-0000</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#A8988D] shrink-0" />
              <span>concierge@monikazparlour.com</span>
            </li>
          </ul>
        </div>

        {/* Guarantees */}
        <div className="space-y-3">
          <h4 className="font-serif text-lg font-bold text-white">Monikaz Promise</h4>
          <div className="bg-[#3D2F2A] p-4 rounded-2xl border border-[#52413A] text-xs text-[#C5B7AE] space-y-2">
            <p className="font-semibold text-[#E5C380]">✔ 100% Organic Products</p>
            <p className="font-semibold text-[#E5C380]">✔ Double-Booking Prevention</p>
            <p className="font-semibold text-[#E5C380]">✔ 3-Hour Cut-off Cancellation</p>
          </div>
        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-[#3D2F2A] text-center text-xs text-[#A8988D] flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© {new Date().getFullYear()} Monikaz Parlour. All rights reserved.</p>
        <p className="flex items-center justify-center gap-1">
          <span>Crafted with elegance</span>
          <Heart className="w-3.5 h-3.5 text-[#D4AF37] fill-current" />
          <span>for Haute Beauty</span>
        </p>
      </div>
    </footer>
  );
};
