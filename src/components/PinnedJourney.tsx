import React, { useRef, useState, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, Heart, Award, ShieldCheck, ChevronRight, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface JourneyStep {
  id: number;
  subtitle: string;
  title: string;
  description: string;
  image: string;
  badge: string;
  highlights: string[];
}

const STEPS: JourneyStep[] = [
  {
    id: 1,
    subtitle: 'Step 01 — Arrival',
    title: 'Sanctuary Welcome & Organic Tea',
    description: 'Step out of the city and into our quiet luxury lounge. Sip custom-blended botanical teas while enjoying a warm aroma towel welcome.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200',
    badge: 'Private Lounge',
    highlights: ['Artisanal herbal tea service', 'Warm essential oil towel', 'Private cloak check'],
  },
  {
    id: 2,
    subtitle: 'Step 02 — Consultation',
    title: 'Micro-Scalp & Skin Diagnosis',
    description: 'Our master stylists conduct a digital scalp and skin diagnostic to curate custom formulas tailored exclusively to your unique cellular profile.',
    image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1200',
    badge: 'Precision Analysis',
    highlights: ['Digital scalp magnification', 'Custom formula creation', 'Aesthetic goal mapping'],
  },
  {
    id: 3,
    subtitle: 'Step 03 — The Haute Craft',
    title: 'Transformative Beauty Rituals',
    description: 'Relax in custom ergonomically heated treatment chairs while receiving 24K gold leaf facials, silk keratin restructuring, or couture styling.',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=1200',
    badge: 'Master Artistry',
    highlights: ['24K gold & LED therapy', 'Italian silk keratin treatment', 'Ergonomic luxury seating'],
  },
  {
    id: 4,
    subtitle: 'Step 04 — The Reveal',
    title: 'The Mirror Unveiling & Care Kit',
    description: 'Experience the exhilarating moment of your final reveal, accompanied by a champagne toast and a complimentary home maintenance luxury kit.',
    image: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200',
    badge: 'The Unveiling',
    highlights: ['Bespoke champagne toast', 'Home beauty regimen kit', '30-day glow guarantee'],
  },
];

export const PinnedJourney: React.FC<{ onOpenBooking: () => void }> = ({ onOpenBooking }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const totalSteps = STEPS.length;

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: `+=${totalSteps * 100}%`,
        pin: true,
        scrub: 0.5,
        onUpdate: (self) => {
          const idx = Math.min(
            totalSteps - 1,
            Math.floor(self.progress * totalSteps)
          );
          setActiveIndex(idx);
        },
      });
    }, containerRef);

    return () => ctx.revert();
  }, [isMobile]);

  return (
    <section className="bg-[#2C221E] text-white py-16 md:py-0 border-y border-[#4A3933] overflow-hidden relative">
      {/* Desktop Pinned Container */}
      <div
        ref={containerRef}
        className="min-h-screen flex flex-col justify-center max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative"
      >
        {/* Header Label */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#4A3933] pb-6">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Client Experience Journey</span>
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-1">
              The Monikaz Sanctuary Ritual
            </h2>
          </div>

          {/* Step Progress Indicators */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <button
                key={step.id}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx ? 'w-10 bg-[#D4AF37]' : 'w-3 bg-stone-700 hover:bg-stone-500'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Dynamic Panel Display */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-[#4A3933] text-[#E5C380] text-xs font-bold tracking-wider uppercase border border-[#D4AF37]/30">
              {STEPS[activeIndex].subtitle}
            </div>

            <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white leading-tight min-h-[2.5rem] transition-all duration-500">
              {STEPS[activeIndex].title}
            </h3>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed min-h-[4.5rem]">
              {STEPS[activeIndex].description}
            </p>

            {/* Highlights List */}
            <div className="space-y-2 pt-2">
              {STEPS[activeIndex].highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-2.5 text-xs text-[#E5C380]">
                  <div className="w-5 h-5 rounded-full bg-[#D4AF37]/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  </div>
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button
                onClick={onOpenBooking}
                className="bg-[#D4AF37] hover:bg-[#E5C380] text-[#2C221E] px-6 py-3 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shadow-lg hover:scale-105"
              >
                <span>Reserve This Ritual</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Image Display with Fade & Zoom Effect */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-2xl h-[340px] sm:h-[420px] bg-stone-900">
              {STEPS.map((step, idx) => (
                <div
                  key={step.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    activeIndex === idx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                  }`}
                >
                  <img
                    src={step.image}
                    alt={step.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transform scale-105 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6">
                    <span className="text-xs uppercase font-bold text-[#E5C380] tracking-widest">
                      {step.badge}
                    </span>
                    <p className="text-lg font-serif font-bold text-white">{step.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
