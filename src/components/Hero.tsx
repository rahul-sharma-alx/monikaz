import React from 'react';
import { Sparkles, Star, Shield, Search, ArrowRight, Award, ChevronDown } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onOpenBooking: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSelectCategory: (cat: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenBooking,
  searchQuery,
  setSearchQuery,
  onSelectCategory,
}) => {
  return (
    <section id="hero-banner" className="relative bg-gradient-to-b from-[#FAF6F3] via-[#F4ECE6] to-[#FAF6F3] pt-10 pb-16 px-4 sm:px-6 lg:px-8 border-b border-[#E8DFD8] overflow-hidden min-h-[90vh] flex flex-col justify-center">
      
      {/* Decorative Background Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8C5B8]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C59B27]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10 my-auto">
        
        {/* Left Copy & Search */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-7 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EAE1D8]/80 backdrop-blur-md border border-[#D9CCC0] text-[#5C4A3E] text-xs font-semibold tracking-wide uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>Exquisite Beauty & Wellness Sanctuary</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-[#2C221E] leading-tight">
            Indulge in <span className="italic font-normal text-[#A87B51]">Timeless Elegance</span> & Rejuvenation.
          </h1>

          <p className="text-[#68584E] text-base sm:text-lg max-w-2xl leading-relaxed">
            Experience bespoke hair styling, 24K gold cellular facials, couture bridal makeups, and therapeutic spa rituals curated by master stylists in an atmosphere of serene luxury.
          </p>

          {/* Quick Search & Booking Controls */}
          <div className="pt-2 max-w-xl">
            <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white/90 backdrop-blur-md rounded-2xl sm:rounded-full border border-[#E3D8CE] shadow-lg">
              <div className="relative flex-1 flex items-center px-3">
                <Search className="w-5 h-5 text-[#9C8B80] mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="Search hair keratin, gold facial, manicure..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent py-2 text-sm text-[#2C221E] placeholder-[#9C8B80] focus:outline-hidden"
                />
              </div>
              <button
                onClick={onOpenBooking}
                className="bg-[#2C221E] hover:bg-[#3D2F2A] text-white px-6 py-3 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0 min-h-[44px]"
              >
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4 text-[#D4AF37]" />
              </button>
            </div>
          </div>

          {/* Quick Category Shortcuts */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-[#68584E]">
            <span className="font-semibold text-[#2C221E]">Popular:</span>
            {['Hair & Styling', 'Facial & Skincare', 'Nails & Hands', 'Makeup & Bridal', 'Body Spa'].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className="px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-xs border border-[#E3D8CE] hover:border-[#A87B51] hover:text-[#A87B51] transition-all cursor-pointer shadow-2xs text-xs font-medium min-h-[36px]"
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 grid grid-cols-3 gap-4 border-t border-[#E8DFD8]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#F2ECE6] text-[#A87B51] flex items-center justify-center shrink-0">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#2C221E] text-sm leading-none">14+ Years</p>
                <p className="text-[11px] text-[#8A7568]">Master Stylists</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#F2ECE6] text-[#C59B27] flex items-center justify-center shrink-0">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <div>
                <p className="font-bold text-[#2C221E] text-sm leading-none">4.95 ★</p>
                <p className="text-[11px] text-[#8A7568]">Customer Rating</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#F2ECE6] text-[#5C4A3E] flex items-center justify-center shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-[#2C221E] text-sm leading-none">100% Organic</p>
                <p className="text-[11px] text-[#8A7568]">Hygienic Products</p>
              </div>
            </div>
          </div>

        </motion.div>

        {/* Right Imagery Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-stone-200">
            <img
              src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1000"
              alt="Monikaz Parlour Salon Ambience"
              referrerPolicy="no-referrer"
              className="w-full h-[380px] sm:h-[440px] object-cover hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">Signature Service</span>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">24K Gold Cellular Rejuvenation</h3>
              <p className="text-xs text-stone-200 mt-1">Includes LED therapy, ultrasonic cleaning & gold leaf mask.</p>
            </div>
          </div>

          {/* Floating Card Badge */}
          <div className="absolute -bottom-5 -left-3 sm:-left-5 bg-white p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#E3D8CE] max-w-xs flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8C5B8] flex items-center justify-center text-[#2C221E] font-bold text-sm shrink-0">
              MS
            </div>
            <div>
              <p className="text-xs font-bold text-[#2C221E]">Monika Sharma</p>
              <p className="text-[11px] text-[#8A7568]">Founder & Senior Stylist</p>
              <div className="flex items-center gap-1 mt-0.5 text-amber-500 text-[10px]">
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <Star className="w-3 h-3 fill-current" />
                <span className="text-stone-500 ml-1">(48 reviews)</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      {/* Subtle Scroll Cue Indicator */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#8A7568]">Scroll To Explore</span>
        <ChevronDown className="w-4 h-4 text-[#A87B51] animate-bounce" />
      </div>

    </section>
  );
};
