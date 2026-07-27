import { Service, Staff, Booking, Review, Profile, BookingStatus, Shop, Address, SocialMedia } from '../types';
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
    const payload = { id: `srv-${Date.now()}`, ...serviceData };
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('services').insert([payload]).select().single();
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
  async getBookings(currentUser?: Profile | null, params?: { staff_id?: string; date?: string; status?: string }): Promise<Booking[]> {
    const supabase = getSupabaseClient();
    const isCustomer = !currentUser || currentUser.role === 'customer';
    const effectiveParams: Record<string, string> = { ...(params as Record<string, string>) };
    if (isCustomer && currentUser?.id) effectiveParams.customer_id = currentUser.id;
    if (supabase) {
      let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
      if (effectiveParams.customer_id) query = query.eq('customer_id', effectiveParams.customer_id);
      if (effectiveParams.staff_id) query = query.eq('staff_id', effectiveParams.staff_id);
      if (effectiveParams.date) query = query.eq('booking_date', effectiveParams.date);
      if (effectiveParams.status) query = query.eq('status', effectiveParams.status);
      const { data, error } = await query;
      if (!error && data) return data as Booking[];
    }

    const queryStr = new URLSearchParams(effectiveParams).toString();
    return fetchApi<Booking[]>(`/api/bookings${queryStr ? `?${queryStr}` : ''}`);
  },

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (!error && data) return data as Booking;
    }
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
  async getReviews(currentUser?: Profile | null): Promise<Review[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      let query = supabase.from('reviews').select('*').order('created_at', { ascending: false });
      if (currentUser && currentUser.role === 'customer') {
        query = query.eq('customer_id', currentUser.id);
      }
      const { data, error } = await query;
      if (!error && data) return data as Review[];
    }
    const params = currentUser && currentUser.role === 'customer' ? `?customer_id=${currentUser.id}` : '';
    return fetchApi<Review[]>(`/api/reviews${params}`);
  },

  async createReview(reviewData: Partial<Review>): Promise<Review> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('reviews').insert([reviewData]).select().single();
      if (!error && data) return data as Review;
    }
    return fetchApi<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  async respondToReview(id: string, response: string): Promise<Review> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('reviews').update({ admin_response: response }).eq('id', id).select().single();
      if (!error && data) return data as Review;
    }
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

  // Shop
  async getShop(): Promise<{ shop: Shop; addresses: Address[]; social_media: SocialMedia[] }> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const [shopRes, addrRes, smRes] = await Promise.all([
        supabase.from('shops').select('*').limit(1).single(),
        supabase.from('addresses').select('*'),
        supabase.from('social_media').select('*'),
      ]);
      if (!shopRes.error && shopRes.data) {
        return {
          shop: shopRes.data as Shop,
          addresses: (addrRes.data || []) as Address[],
          social_media: (smRes.data || []) as SocialMedia[],
        };
      }
    }
    return fetchApi('/api/shop');
  },

  async updateShop(data: { name?: string; logo_url?: string }): Promise<Shop> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data: d, error } = await supabase.from('shops').update(data).eq('id', 'shop-1').select().single();
      if (!error && d) return d as Shop;
    }
    return fetchApi('/api/shop', { method: 'PUT', body: JSON.stringify(data) });
  },

  async addAddress(address: string): Promise<Address> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('addresses').insert([{ id: `addr-${Date.now()}`, shop_id: 'shop-1', address }]).select().single();
      if (!error && data) return data as Address;
    }
    return fetchApi('/api/shop/addresses', { method: 'POST', body: JSON.stringify({ address }) });
  },

  async deleteAddress(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('addresses').delete().eq('id', id);
      return;
    }
    await fetchApi(`/api/shop/addresses/${id}`, { method: 'DELETE' });
  },

  async addSocialMedia(media_name: string, link: string): Promise<SocialMedia> {
    const supabase = getSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('social_media').insert([{ id: `sm-${Date.now()}`, shop_id: 'shop-1', media_name, link }]).select().single();
      if (!error && data) return data as SocialMedia;
    }
    return fetchApi('/api/shop/social-media', { method: 'POST', body: JSON.stringify({ media_name, link }) });
  },

  async deleteSocialMedia(id: string): Promise<void> {
    const supabase = getSupabaseClient();
    if (supabase) {
      await supabase.from('social_media').delete().eq('id', id);
      return;
    }
    await fetchApi(`/api/shop/social-media/${id}`, { method: 'DELETE' });
  },
};
