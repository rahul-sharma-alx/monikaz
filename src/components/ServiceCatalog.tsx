import React, { useState, useMemo } from 'react';
import { Service } from '../types';
import { Clock, Sparkles, Filter, Check, Eye, ArrowUpDown, X, SlidersHorizontal, RotateCcw } from 'lucide-react';

interface ServiceCatalogProps {
  services: Service[];
  onBookService: (service: Service) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

const CATEGORIES = [
  'All',
  'Hair & Styling',
  'Facial & Skincare',
  'Nails & Hands',
  'Makeup & Bridal',
  'Body Spa'
];

export type DurationFilter = 'all' | 'under30' | '30to60' | 'over60';
export type SortOption = 'default' | 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc';

export const ServiceCatalog: React.FC<ServiceCatalogProps> = ({
  services,
  onBookService,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery
}) => {
  const [maxPrice, setMaxPrice] = useState<number>(5000);
  const [durationFilter, setDurationFilter] = useState<DurationFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [detailModalService, setDetailModalService] = useState<Service | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState<boolean>(false);

  // Filter & Sort Logic
  const filteredServices = useMemo(() => {
    const filtered = services.filter(service => {
      if (!service.is_active) return false;

      // Category match
      const matchesCat = selectedCategory === 'All' || service.category === selectedCategory;

      // Search match
      const matchesSearch =
        searchQuery.trim() === '' ||
        service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Price match
      const matchesPrice = service.price <= maxPrice;

      // Duration match
      let matchesDuration = true;
      if (durationFilter === 'under30') {
        matchesDuration = service.duration_minutes < 30;
      } else if (durationFilter === '30to60') {
        matchesDuration = service.duration_minutes >= 30 && service.duration_minutes <= 60;
      } else if (durationFilter === 'over60') {
        matchesDuration = service.duration_minutes > 60;
      }

      return matchesCat && matchesSearch && matchesPrice && matchesDuration;
    });

    // Sorting
    const sorted = [...filtered];
    if (sortBy === 'price-asc') {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      sorted.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'duration-asc') {
      sorted.sort((a, b) => a.duration_minutes - b.duration_minutes);
    } else if (sortBy === 'duration-desc') {
      sorted.sort((a, b) => b.duration_minutes - a.duration_minutes);
    }

    return sorted;
  }, [services, selectedCategory, searchQuery, maxPrice, durationFilter, sortBy]);

  // Count active non-default filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (durationFilter !== 'all') count++;
    if (maxPrice < 400) count++;
    if (sortBy !== 'default') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [selectedCategory, durationFilter, maxPrice, sortBy, searchQuery]);

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setDurationFilter('all');
    setMaxPrice(400);
    setSortBy('default');
    setSearchQuery('');
  };

  return (
    <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#A87B51] font-bold">Bespoke Menu</span>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2C221E] mt-1">
            Our Signature Services
          </h2>
          <p className="text-[#8A7568] text-xs sm:text-sm mt-1 max-w-xl">
            Select a service to view duration, details, and book your tailored beauty experience with our expert team.
          </p>
        </div>

        {/* Mobile Filter Toggle & Quick Controls */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="flex-1 sm:flex-none py-2.5 px-4 rounded-2xl bg-[#FAF6F3] border border-[#E3D8CE] text-xs font-semibold text-[#2C221E] hover:bg-[#F2ECE6] transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4 text-[#A87B51]" />
            <span>Filter & Sort</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#2C221E] text-white text-[10px] font-bold flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={resetAllFilters}
              title="Reset all filters"
              className="py-2.5 px-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-100 transition-colors flex items-center justify-center gap-1 cursor-pointer min-h-[44px]"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills - Scrollable on Mobile with Touch Target Height */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer min-h-[44px] flex items-center justify-center shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#2C221E] text-white border border-[#2C221E] shadow-xs'
                : 'bg-white text-[#68584E] border border-[#E3D8CE] hover:border-[#A87B51] hover:text-[#2C221E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Secondary Controls Bar: Duration Filters & Sorting (Visible or Collapsible) */}
      <div className={`space-y-4 mb-8 bg-[#FAF6F3] p-4 rounded-3xl border border-[#E3D8CE] transition-all ${
        isMobileFilterOpen ? 'block animate-in fade-in slide-in-from-top-2 duration-200' : 'hidden md:block'
      }`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Duration Filter Pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A87B51] mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Service Duration</span>
            </label>
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 bg-white p-1 rounded-2xl border border-[#E3D8CE]">
              <button
                onClick={() => setDurationFilter('all')}
                className={`py-2 px-3 text-xs font-medium rounded-xl transition-colors cursor-pointer text-center min-h-[44px] ${
                  durationFilter === 'all'
                    ? 'bg-[#2C221E] text-white font-bold'
                    : 'text-[#68584E] hover:bg-[#F2ECE6]'
                }`}
              >
                All Durations
              </button>
              <button
                onClick={() => setDurationFilter('under30')}
                className={`py-2 px-3 text-xs font-medium rounded-xl transition-colors cursor-pointer text-center min-h-[44px] ${
                  durationFilter === 'under30'
                    ? 'bg-[#2C221E] text-white font-bold'
                    : 'text-[#68584E] hover:bg-[#F2ECE6]'
                }`}
              >
                &lt; 30 mins
              </button>
              <button
                onClick={() => setDurationFilter('30to60')}
                className={`py-2 px-3 text-xs font-medium rounded-xl transition-colors cursor-pointer text-center min-h-[44px] ${
                  durationFilter === '30to60'
                    ? 'bg-[#2C221E] text-white font-bold'
                    : 'text-[#68584E] hover:bg-[#F2ECE6]'
                }`}
              >
                30 – 60 mins
              </button>
              <button
                onClick={() => setDurationFilter('over60')}
                className={`py-2 px-3 text-xs font-medium rounded-xl transition-colors cursor-pointer text-center min-h-[44px] ${
                  durationFilter === 'over60'
                    ? 'bg-[#2C221E] text-white font-bold'
                    : 'text-[#68584E] hover:bg-[#F2ECE6]'
                }`}
              >
                60+ mins
              </button>
            </div>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#A87B51] mb-2 flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort Services</span>
            </label>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-white border border-[#E3D8CE] rounded-2xl py-2.5 px-3 text-xs font-semibold text-[#2C221E] focus:outline-hidden focus:border-[#2C221E] cursor-pointer min-h-[44px]"
              >
                <option value="default">Sort by: Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="duration-asc">Duration: Shortest First</option>
                <option value="duration-desc">Duration: Longest First</option>
              </select>
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#A87B51] mb-2">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5" />
                <span>Max Price</span>
              </span>
              <span className="text-[#2C221E] font-bold text-xs">₹{maxPrice}</span>
            </div>
            <div className="bg-white p-2 rounded-2xl border border-[#E3D8CE] flex items-center gap-3">
              <input
                type="range"
                min="500"
                max="5000"
                step="100"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#2C221E] cursor-pointer h-2"
              />
            </div>
          </div>

        </div>

        {/* Applied Filters Summary Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-[#E3D8CE] flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[#8A7568] font-medium">Active filters:</span>
              {selectedCategory !== 'All' && (
                <span className="bg-[#EAE1D8] text-[#2C221E] px-2.5 py-1 rounded-full font-medium text-[11px] flex items-center gap-1">
                  Category: {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('All')} />
                </span>
              )}
              {durationFilter !== 'all' && (
                <span className="bg-[#EAE1D8] text-[#2C221E] px-2.5 py-1 rounded-full font-medium text-[11px] flex items-center gap-1">
                  Duration: {durationFilter === 'under30' ? '< 30 mins' : durationFilter === '30to60' ? '30-60 mins' : '60+ mins'}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setDurationFilter('all')} />
                </span>
              )}
              {maxPrice < 5000 && (
                <span className="bg-[#EAE1D8] text-[#2C221E] px-2.5 py-1 rounded-full font-medium text-[11px] flex items-center gap-1">
                  Max ₹{maxPrice}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMaxPrice(5000)} />
                </span>
              )}
              {searchQuery && (
                <span className="bg-[#EAE1D8] text-[#2C221E] px-2.5 py-1 rounded-full font-medium text-[11px] flex items-center gap-1">
                  Search: "{searchQuery}"
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                </span>
              )}
            </div>

            <button
              onClick={resetAllFilters}
              className="text-[#A87B51] hover:text-[#2C221E] font-bold text-xs underline cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Services Grid (Mobile First 1-col, Tablet 2-col, Desktop 3-col) */}
      {filteredServices.length === 0 ? (
        <div className="text-center py-16 px-4 bg-[#FAF6F3] rounded-3xl border border-dashed border-[#D9CCC0]">
          <p className="font-serif text-lg font-medium text-[#2C221E]">No services match your filters</p>
          <p className="text-xs text-[#8A7568] mt-1 max-w-sm mx-auto">
            Try adjusting your duration filter, price limit, or search criteria.
          </p>
          <button
            onClick={resetAllFilters}
            className="mt-4 px-5 py-2.5 bg-[#2C221E] text-white text-xs font-semibold rounded-full cursor-pointer hover:bg-[#3D2F2A] min-h-[44px]"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-3xl overflow-hidden border border-[#E3D8CE] shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              {/* Service Header with Responsive Image */}
              <div>
                <div className="relative h-48 sm:h-52 overflow-hidden bg-stone-100">
                  <img
                    src={service.image_url}
                    alt={service.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-[#2C221E]/80 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-full border border-white/20">
                    {service.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-[#2C221E] text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                    ₹{service.price}
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 sm:p-6 space-y-3">
                  <div className="flex items-center justify-between text-xs text-[#A87B51] font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#A87B51]" />
                      <span>{service.duration_minutes} Mins Duration</span>
                    </span>
                    <span className="text-[11px] text-[#8A7568] bg-[#FAF6F3] px-2 py-0.5 rounded-md border border-[#E3D8CE]">
                      {service.duration_minutes < 30 ? 'Express' : service.duration_minutes <= 60 ? 'Standard' : 'Deluxe'}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C221E] group-hover:text-[#A87B51] transition-colors leading-snug">
                    {service.name}
                  </h3>

                  <p className="text-[#68584E] text-xs leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>
              </div>

              {/* Card Action Buttons with Touch Sizing */}
              <div className="p-5 sm:p-6 pt-0 border-t border-[#F2ECE6] mt-2 flex items-center justify-between gap-3">
                <button
                  onClick={() => setDetailModalService(service)}
                  className="text-xs font-semibold text-[#8A7568] hover:text-[#2C221E] flex items-center gap-1 cursor-pointer py-2 px-1 min-h-[44px]"
                >
                  <Eye className="w-4 h-4 text-[#A87B51]" />
                  <span>Details</span>
                </button>

                <button
                  onClick={() => onBookService(service)}
                  className="bg-[#2C221E] hover:bg-[#4A3933] text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs min-h-[44px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Book Service</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Service Detail Modal — Fully Responsive Mobile Drawer/Modal */}
      {detailModalService && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[#E3D8CE] shadow-2xl animate-in slide-in-from-bottom duration-200 sm:animate-in sm:zoom-in">
            <div className="relative h-52 sm:h-60 bg-stone-100">
              <img
                src={detailModalService.image_url}
                alt={detailModalService.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setDetailModalService(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center cursor-pointer hover:bg-black transition-colors min-w-[44px] min-h-[44px]"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#A87B51] bg-[#F4ECE6] px-3 py-1 rounded-full">
                  {detailModalService.category}
                </span>
                <span className="font-serif text-2xl font-bold text-[#2C221E]">
                  ₹{detailModalService.price}
                </span>
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#2C221E]">
                {detailModalService.name}
              </h3>

              <div className="flex items-center gap-2 text-xs text-[#8A7568]">
                <Clock className="w-4 h-4 text-[#A87B51]" />
                <span className="font-semibold">{detailModalService.duration_minutes} minutes duration</span>
              </div>

              <p className="text-sm text-[#52433A] leading-relaxed">
                {detailModalService.description}
              </p>

              <div className="bg-[#FAF6F3] p-4 rounded-2xl border border-[#E3D8CE] space-y-2">
                <p className="text-xs font-bold text-[#2C221E]">What's Included:</p>
                <ul className="text-xs text-[#68584E] space-y-1.5">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Personalized consultation with certified specialist</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>100% premium organic products & soothing tea service</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Free reschedule / cancellation up to 3 hours prior</span>
                  </li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 sticky bottom-0 bg-white pb-2 pt-2 border-t border-[#F2ECE6]">
                <button
                  onClick={() => setDetailModalService(null)}
                  className="px-4 py-2.5 rounded-full text-xs font-semibold text-[#68584E] hover:bg-[#FAF6F3] transition-colors cursor-pointer min-h-[44px]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    const s = detailModalService;
                    setDetailModalService(null);
                    onBookService(s);
                  }}
                  className="bg-[#2C221E] hover:bg-[#4A3933] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 shadow-xs min-h-[44px]"
                >
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Proceed to Booking</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </section>
  );
};
