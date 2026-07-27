import React, { useState, useRef } from 'react';
import { Sparkles, Sliders, ArrowLeftRight, CheckCircle2 } from 'lucide-react';

export const TransformationReveal: React.FC = () => {
  const [sliderPos, setSliderPos] = useState<number>(50);
  const isDragging = useRef<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;
    setSliderPos(percentage);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 || isDragging.current) {
      handleMove(e.clientX);
    }
  };

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-[#A87B51] flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real Client Results</span>
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E] mt-1">
          Interactive Transformation Reveal
        </h2>
        <p className="text-[#8A7568] text-xs sm:text-sm mt-2">
          Slide across to witness the restorative power of our 24K Gold Cellular Facial & Italian Silk Keratin Therapy.
        </p>
      </div>

      {/* Interactive Drag & Scrub Canvas */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        className="relative max-w-4xl mx-auto h-[380px] sm:h-[480px] rounded-3xl overflow-hidden border-2 border-[#E3D8CE] shadow-2xl select-none cursor-ew-resize bg-stone-900"
      >
        {/* Before Image (Left Layer) */}
        <img
          src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200"
          alt="Before Treatment"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover filter grayscale contrast-125"
        />
        <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-full border border-white/20">
          BEFORE — Initial Consultation
        </div>

        {/* After Image (Right Clipped Layer) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src="https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200"
            alt="After Treatment Glow"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover max-w-none"
            style={{ width: containerRef.current ? `${containerRef.current.offsetWidth}px` : '100%' }}
          />
          <div className="absolute top-4 left-4 bg-[#2C221E] text-[#D4AF37] text-xs font-bold px-3.5 py-1.5 rounded-full border border-[#D4AF37]/40 shadow-lg flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AFTER — 24K Gold & Silk Glow</span>
          </div>
        </div>

        {/* Drag Divider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl flex items-center justify-center z-20"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="w-10 h-10 rounded-full bg-[#2C221E] text-[#D4AF37] border-2 border-white shadow-xl flex items-center justify-center -ml-0.5 transform transition-transform hover:scale-110">
            <ArrowLeftRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Feature Guarantee Callout */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="bg-[#FAF6F3] p-4 rounded-2xl border border-[#E3D8CE] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#2C221E]">Immediate Smoothness</p>
            <p className="text-[11px] text-[#8A7568]">98% hair frizz reduction</p>
          </div>
        </div>
        <div className="bg-[#FAF6F3] p-4 rounded-2xl border border-[#E3D8CE] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#2C221E]">Deep Hydration</p>
            <p className="text-[11px] text-[#8A7568]">Visible cellular glow</p>
          </div>
        </div>
        <div className="bg-[#FAF6F3] p-4 rounded-2xl border border-[#E3D8CE] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#2C221E]">30-Day Guarantee</p>
            <p className="text-[11px] text-[#8A7568]">Complimentary touch-up</p>
          </div>
        </div>
      </div>
    </section>
  );
};
