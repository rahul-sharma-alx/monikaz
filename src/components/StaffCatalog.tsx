import React from 'react';
import { Staff } from '../types';
import { Star, Sparkles, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface StaffCatalogProps {
  staffList: Staff[];
  onBookWithStaff: (staff: Staff) => void;
}

export const StaffCatalog: React.FC<StaffCatalogProps> = ({ staffList, onBookWithStaff }) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs uppercase tracking-widest text-[#A87B51] font-bold">Artisans & Stylists</span>
        <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#2C221E] mt-1">
          Meet Our Master Team
        </h2>
        <p className="text-[#8A7568] text-sm mt-2 leading-relaxed">
          Our team brings decades of international expertise, artistic vision, and compassionate care to every single appointment.
        </p>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-50px' }}
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {staffList.filter(s => s.is_active).map((staff) => (
          <motion.div
            key={staff.id}
            variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-3xl overflow-hidden border border-[#E3D8CE] shadow-2xs hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between"
          >
            <div>
              {/* Image & Rating */}
              <div className="relative h-64 overflow-hidden bg-stone-100">
                <img
                  src={staff.photo_url}
                  alt={staff.full_name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-[#2C221E] shadow-sm flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                  <span>{staff.rating || 5.0}</span>
                  <span className="text-stone-400 font-normal">({staff.reviews_count || 12})</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#A87B51] font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Experienced Professional</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-[#2C221E] mt-1">
                    {staff.full_name}
                  </h3>
                </div>

                <p className="text-[#68584E] text-xs leading-relaxed">
                  {staff.bio}
                </p>

                {/* Specialties Pills */}
                <div>
                  <span className="text-[11px] font-bold text-[#2C221E] block mb-2 uppercase tracking-wider">
                    Specialties
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {staff.specialties.map((spec, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-full bg-[#FAF6F3] border border-[#E3D8CE] text-[11px] font-medium text-[#52433A]"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 sm:p-6 pt-0">
              <button
                onClick={() => onBookWithStaff(staff)}
                className="w-full bg-[#2C221E] hover:bg-[#4A3933] text-white font-medium text-xs py-3 rounded-full transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Book Appointment with {staff.full_name.split(' ')[0]}</span>
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};
