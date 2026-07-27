import { Service, Staff, Booking, Review, Profile, BookingStatus } from '../types';
import { getSupabaseClient } from '../lib/supabase';

// Helper for HTTP requests
async function fetchApi<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP Error ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Services
  async getServices(): Promise<Service[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Service[];
    }
    return fetchApi<Service[]>('/api/services');
  },

  async createService(serviceData: Partial<Service>): Promise<Service> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('services').insert([serviceData]).select().single();
      if (!error && data) return data as Service;
    }
    return fetchApi<Service>('/api/services', {
      method: 'POST',
      body: JSON.stringify(serviceData),
    });
  },

  async updateService(id: string, serviceData: Partial<Service>): Promise<Service> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('services').update(serviceData).eq('id', id).select().single();
      if (!error && data) return data as Service;
    }
    return fetchApi<Service>(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData),
    });
  },

  async deleteService(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('services').delete().eq('id', id);
      return;
    }
    await fetchApi(`/api/services/${id}`, { method: 'DELETE' });
  },

  // Staff
  async getStaff(): Promise<Staff[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('staff').select('*').order('created_at', { ascending: true });
      if (!error && data) return data as Staff[];
    }
    return fetchApi<Staff[]>('/api/staff');
  },

  async createStaff(staffData: Partial<Staff>): Promise<Staff> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('staff').insert([staffData]).select().single();
      if (!error && data) return data as Staff;
    }
    return fetchApi<Staff>('/api/staff', {
      method: 'POST',
      body: JSON.stringify(staffData),
    });
  },

  async updateStaff(id: string, staffData: Partial<Staff>): Promise<Staff> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('staff').update(staffData).eq('id', id).select().single();
      if (!error && data) return data as Staff;
    }
    return fetchApi<Staff>(`/api/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staffData),
    });
  },

  // Bookings
  async getBookings(params?: { customer_id?: string; staff_id?: string; date?: string; status?: string }): Promise<Booking[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (params?.customer_id) query = query.eq('customer_id', params.customer_id);
      if (params?.staff_id) query = query.eq('staff_id', params.staff_id);
      if (params?.date) query = query.eq('booking_date', params.date);
      if (params?.status) query = query.eq('status', params.status);
      const { data, error } = await query;
      if (!error && data) return data as Booking[];
    }

    const queryStr = new URLSearchParams(params as Record<string, string>).toString();
    return fetchApi<Booking[]>(`/api/bookings${queryStr ? `?${queryStr}` : ''}`);
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return fetchApi<Booking>('/api/bookings', {
      method: 'POST',
      body: JSON.stringify(bookingData),
    });
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('bookings')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (!error && data) return data as Booking;
    }
    return fetchApi<Booking>(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Reviews
  async getReviews(): Promise<Review[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (!error && data) return data as Review[];
    }
    return fetchApi<Review[]>('/api/reviews');
  },

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    return fetchApi<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  async respondToReview(id: string, response: string): Promise<Review> {
    return fetchApi<Review>(`/api/reviews/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  // Email logs
  async getEmailLogs(): Promise<any[]> {
    return fetchApi<any[]>('/api/email-logs');
  },

  // Realtime Stream Subscriber
  subscribeRealtime(onEvent: (event: string, payload: any) => void): () => void {
    const supabase = getSupabaseClient();
    if (supabase) {
      const channel = supabase
        .channel('realtime_salon')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, payload => {
          onEvent('booking_updated', payload.new);
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, payload => {
          onEvent('review_added', payload.new);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Fallback to Express Server-Sent Events stream
    const eventSource = new EventSource('/api/realtime/stream');

    const handleEvent = (event: MessageEvent, eventName: string) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(eventName, data);
      } catch (e) {
        console.error('Failed to parse SSE payload:', e);
      }
    };

    eventSource.addEventListener('booking_created', e => handleEvent(e as MessageEvent, 'booking_created'));
    eventSource.addEventListener('booking_status_changed', e => handleEvent(e as MessageEvent, 'booking_status_changed'));
    eventSource.addEventListener('review_added', e => handleEvent(e as MessageEvent, 'review_added'));
    eventSource.addEventListener('service_updated', e => handleEvent(e as MessageEvent, 'service_updated'));

    return () => {
      eventSource.close();
    };
  },
};
