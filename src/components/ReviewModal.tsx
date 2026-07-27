import React, { useState } from 'react';
import { Booking } from '../types';
import { Star, Sparkles, AlertCircle } from 'lucide-react';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  onSubmitReview: (bookingId: string, rating: number, comment: string) => Promise<void>;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !booking) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      await onSubmitReview(booking.id, rating, comment);
      setLoading(false);
      onClose();
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err.message || 'Failed to submit review.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#E3D8CE] shadow-2xl animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#F2ECE6] pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#A87B51]">
              Verified Feedback
            </span>
            <h3 className="font-serif text-xl font-bold text-[#2C221E]">Rate Your Beauty Experience</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center cursor-pointer hover:bg-stone-200"
          >
            ✕
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Booking Context */}
        <div className="bg-[#FAF6F3] p-4 rounded-2xl border border-[#E3D8CE] text-xs space-y-1">
          <p className="font-bold text-[#2C221E]">{booking.service_name}</p>
          <p className="text-[#8A7568]">Stylist: {booking.staff_name} • Date: {booking.booking_date}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Star Rating Picker */}
          <div>
            <label className="block text-xs font-bold text-[#2C221E] mb-2 text-center uppercase tracking-wider">
              Your Rating (1 to 5 Stars)
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 cursor-pointer transform hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-[#2C221E] mb-1">
              Your Experience & Comments
            </label>
            <textarea
              rows={4}
              required
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the atmosphere, service quality, and result..."
              className="w-full bg-[#FAF6F3] border border-[#E3D8CE] rounded-2xl p-3 text-xs text-[#2C221E] focus:outline-hidden focus:border-[#2C221E]"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#8A7568] hover:bg-[#FAF6F3] rounded-full cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#2C221E] hover:bg-[#4A3933] text-white px-6 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{loading ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
