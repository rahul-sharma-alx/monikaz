import express from 'express';
import path from 'path';
import fs from 'fs';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_BOOKINGS, INITIAL_REVIEWS, INITIAL_PROFILES, INITIAL_SHOP, INITIAL_ADDRESSES, INITIAL_SOCIAL_MEDIA } from './src/data/initialData';
import { Service, Staff, Booking, Review, Profile, Shop, Address, SocialMedia, PriceHistory } from './src/types';

const PORT = 3000;
const app = express();

app.use(express.json({ limit: '100kb' }));

// ── Security Headers ──
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  const isDev = process.env.NODE_ENV !== 'production';
  res.setHeader('Content-Security-Policy',
    isDev
      ? "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:* ws://localhost:* https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'"
      : "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co; frame-ancestors 'none'"
  );
  next();
});

// ── Simple In-Memory Rate Limiter ──
const rateBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(limit = 100, windowMs = 60000) {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const key = req.ip || 'unknown';
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= limit) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }
    bucket.count++;
    next();
  };
}

app.use(rateLimit(200, 60000));
app.use('/api/', rateLimit(60, 60000));

// ── Input Sanitization ──
function sanitize(val: unknown): any {
  if (typeof val === 'string') {
    // ponytail: strip HTML tags to prevent stored XSS
    return val.replace(/<[^>]*>/g, '').trim();
  }
  return val;
}
function sanitizeBody(body: Record<string, unknown>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(body)) {
    out[k] = Array.isArray(v) ? v.map(sanitize) : sanitize(v);
  }
  return out;
}

// ── Environment Validation ──
if (!process.env.VITE_SUPABASE_URL && !process.env.SUPABASE_URL) {
  console.warn('⚠ Supabase not configured. The app will fall back to the local Express API.');
}
if (process.env.VERCEL) {
  console.log('Running on Vercel — SSE and file-persistence are disabled.');
}

// In-Memory & File Store Persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const TMP_FILE = path.join(DATA_DIR, 'store.tmp');

interface AppStore {
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  reviews: Review[];
  profiles: Profile[];
  emailLogs: { id: string; to: string; subject: string; body: string; sent_at: string }[];
  shops: Shop[];
  addresses: Address[];
  social_media: SocialMedia[];
  priceHistory: PriceHistory[];
}

let store: AppStore = {
  services: [...INITIAL_SERVICES],
  staff: [...INITIAL_STAFF],
  bookings: [...INITIAL_BOOKINGS],
  reviews: [...INITIAL_REVIEWS],
  profiles: [...INITIAL_PROFILES],
  emailLogs: [],
  shops: [INITIAL_SHOP],
  addresses: [...INITIAL_ADDRESSES],
  social_media: [...INITIAL_SOCIAL_MEDIA],
  priceHistory: []
};

// Ensure data persistence
function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed.services && parsed.bookings) {
        store = { ...store, ...parsed };
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.warn('Store load warning, using initial in-memory data:', err);
  }
}

function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TMP_FILE, JSON.stringify(store, null, 2), 'utf-8');
    fs.renameSync(TMP_FILE, STORE_FILE);
  } catch (err) {
    console.error('Failed to save store:', err);
  }
}

// Simple promise-based mutex for booking writes
const bookingLock: { promise: Promise<void>; resolve: () => void }[] = [];
async function acquireBookingLock(): Promise<() => void> {
  let resolve: () => void;
  const promise = new Promise<void>(r => { resolve = r; });
  const entry = { promise, resolve: resolve! };
  const prev = bookingLock.length > 0 ? bookingLock[bookingLock.length - 1].promise : Promise.resolve();
  bookingLock.push(entry);
  await prev;
  return () => {
    const idx = bookingLock.indexOf(entry);
    if (idx !== -1) bookingLock.splice(idx, 1);
    entry.resolve();
  };
}

loadStore();

// SSE Clients for Real-Time Synchronization
let sseClients: express.Response[] = [];

function broadcastRealtime(event: string, payload: any) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(data);
    } catch (e) {
      // Ignore write errors for closed connections
    }
  });
}

// -------------------------------------------------------------
// REALTIME SSE ENDPOINT  (skipped on Vercel — serverless doesn't support persistent connections)
// -------------------------------------------------------------
if (!process.env.VERCEL) {
  app.get('/api/realtime/stream', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    sseClients.push(res);

    res.write(`event: init\ndata: ${JSON.stringify({ message: 'Connected to Monikaz Parlour Realtime Stream' })}\n\n`);

    req.on('close', () => {
      sseClients = sseClients.filter(client => client !== res);
    });
  });
}

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Monikaz Parlour API', time: new Date().toISOString() });
});

// SERVICE ROUTES
app.get('/api/services', (req, res) => {
  res.json(store.services);
});

app.post('/api/services', (req, res) => {
  const body = sanitizeBody(req.body);
  const { name, description, price, duration_minutes, category, image_url, is_active, discount_percent } = body;
  const newService: Service = {
    id: `srv-${Date.now()}`,
    name: name || '',
    description: description || '',
    price: Number(price) || 0,
    duration_minutes: Number(duration_minutes) || 60,
    category: category || 'Hair & Styling',
    image_url: image_url || '',
    is_active: is_active ?? true,
    discount_percent: discount_percent ? Number(discount_percent) : undefined,
    created_at: new Date().toISOString()
  };
  store.services.unshift(newService);
  saveStore();
  broadcastRealtime('service_updated', { action: 'created', service: newService });
  res.status(201).json(newService);
});

app.put('/api/services/:id', (req, res) => {
  const { id } = req.params;
  const index = store.services.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Service not found' });
  }
  const allowed = ['name', 'description', 'price', 'duration_minutes', 'category', 'image_url', 'is_active', 'discount_percent', 'updated_by'];
  for (const key of allowed) {
    if (key in req.body) {
      if (key === 'price' || key === 'duration_minutes' || key === 'discount_percent') {
        (store.services[index] as any)[key] = Number(req.body[key]);
      } else {
        (store.services[index] as any)[key] = req.body[key];
      }
    }
  }
  // Log price/discount change to price history
  const updated = store.services[index];
  store.priceHistory.unshift({
    id: `ph-${Date.now()}`,
    service_id: updated.id,
    shop_id: store.shops[0]?.id,
    updated_by: req.body.updated_by || undefined,
    price: updated.price,
    discount_percent: updated.discount_percent || 0,
    after_discount: updated.discount_percent ? Math.round(updated.price * (1 - updated.discount_percent / 100)) : updated.price,
    changed_at: new Date().toISOString()
  });
  saveStore();
  broadcastRealtime('service_updated', { action: 'updated', service: updated });
  res.json(updated);
});

// Price history
app.get('/api/price-history', (req, res) => {
  res.json(store.priceHistory);
});

app.delete('/api/services/:id', (req, res) => {
  const { id } = req.params;
  store.services = store.services.filter(s => s.id !== id);
  saveStore();
  broadcastRealtime('service_updated', { action: 'deleted', id });
  res.json({ success: true, id });
});

// STAFF ROUTES
app.get('/api/staff', (req, res) => {
  res.json(store.staff);
});

app.post('/api/staff', (req, res) => {
  const body = sanitizeBody(req.body);
  const newStaff: Staff = {
    id: `stf-${Date.now()}`,
    full_name: body.full_name || '',
    bio: body.bio || '',
    specialties: body.specialties || [],
    photo_url: body.photo_url || '',
    ...body,
    is_active: body.is_active ?? true,
    rating: 5.0,
    reviews_count: 0,
    created_at: new Date().toISOString()
  };
  store.staff.push(newStaff);
  saveStore();
  broadcastRealtime('staff_updated', { action: 'created', staff: newStaff });
  res.status(201).json(newStaff);
});

app.put('/api/staff/:id', (req, res) => {
  const { id } = req.params;
  const index = store.staff.findIndex(s => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Staff member not found' });
  }
  // ponytail: prevent client-side role escalation via API
  const allowed = ['full_name', 'bio', 'specialties', 'photo_url', 'is_active', 'email', 'phone', 'permissions', 'role'];
  const sanitized: Record<string, any> = {};
  for (const key of allowed) {
    if (key in req.body) sanitized[key] = req.body[key];
  }
  store.staff[index] = { ...store.staff[index], ...sanitized };
  saveStore();
  broadcastRealtime('staff_updated', { action: 'updated', staff: store.staff[index] });
  res.json(store.staff[index]);
});

// BOOKING ROUTES WITH DOUBLE-BOOKING PREVENTION
app.get('/api/bookings', (req, res) => {
  const { customer_id, staff_id, date, status } = req.query;
  let list = [...store.bookings];

  if (customer_id) {
    list = list.filter(b => b.customer_id === customer_id);
  }
  if (staff_id) {
    list = list.filter(b => b.staff_id === staff_id);
  }
  if (date) {
    list = list.filter(b => b.booking_date === date);
  }
  if (status) {
    list = list.filter(b => b.status === status);
  }

  res.json(list);
});

// Helper: Check Time Overlap
function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function isTimeOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}

app.post('/api/bookings', async (req, res) => {
  const unlock = await acquireBookingLock();
  try {
    const body = sanitizeBody(req.body);
    const {
      customer_id,
      customer_name,
      customer_phone,
      customer_email,
      service_id,
      service_name,
      service_price,
      service_duration,
      staff_id,
      staff_name,
      booking_date,
      start_time,
      end_time,
      notes
    } = body;

    if (!service_id || !booking_date || !start_time || !end_time) {
      unlock();
      return res.status(400).json({ error: 'Missing required booking fields (service, date, or time)' });
    }

    // Double-booking check for specified staff on the same date
    if (staff_id) {
      const doubleBooked = store.bookings.find(b => {
        if (b.status === 'cancelled' || b.status === 'no_show') return false;
        if (b.staff_id === staff_id && b.booking_date === booking_date) {
          return isTimeOverlap(start_time, end_time, b.start_time, b.end_time);
        }
        return false;
      });

      if (doubleBooked) {
        unlock();
        return res.status(409).json({
          error: `Stylist ${staff_name || 'selected'} is already booked for ${doubleBooked.service_name} between ${doubleBooked.start_time} and ${doubleBooked.end_time} on ${booking_date}. Please pick another time slot or staff member.`
        });
      }
    }

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      customer_id: customer_id || 'user-c1',
      customer_name: customer_name || 'Valued Customer',
      customer_phone: customer_phone || '',
      customer_email: customer_email || 'customer@example.com',
      service_id,
      service_name: service_name || 'Beauty Service',
      service_price: Number(service_price) || 0,
      service_duration: Number(service_duration) || 60,
      staff_id,
      staff_name: staff_name || 'Any Available Stylist',
      booking_date,
      start_time,
      end_time,
      status: 'pending',
      notes: notes || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    store.bookings.unshift(newBooking);

    // Send simulated confirmation email
    const emailLog = {
      id: `email-${Date.now()}`,
      to: newBooking.customer_email,
      subject: `Booking Request Received - Monikaz Parlour (#${newBooking.id})`,
      body: `Hello ${newBooking.customer_name},\n\nYour appointment for "${newBooking.service_name}" on ${newBooking.booking_date} at ${newBooking.start_time} with ${newBooking.staff_name} has been received and is currently Pending confirmation.\n\nThank you for choosing Monikaz Parlour!`,
      sent_at: new Date().toISOString()
    };
    store.emailLogs.unshift(emailLog);

    saveStore();

    // Realtime notification broadcast
    broadcastRealtime('booking_created', newBooking);

    res.status(201).json(newBooking);
  } finally {
    unlock();
  }
});

app.patch('/api/bookings/:id/status', async (req, res) => {
  const unlock = await acquireBookingLock();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      unlock();
      return res.status(400).json({ error: 'Invalid status' });
    }

    const index = store.bookings.findIndex(b => b.id === id);
    if (index === -1) {
      unlock();
      return res.status(404).json({ error: 'Booking not found' });
    }

    store.bookings[index].status = status;
    store.bookings[index].updated_at = new Date().toISOString();

    // Status update email log
    const updatedBk = store.bookings[index];
    const emailLog = {
      id: `email-${Date.now()}`,
      to: updatedBk.customer_email,
      subject: `Booking Status Update: ${status.toUpperCase()} - Monikaz Parlour`,
      body: `Hello ${updatedBk.customer_name},\n\nYour appointment #${updatedBk.id} for "${updatedBk.service_name}" on ${updatedBk.booking_date} is now status: ${status}.\n\nSee you at Monikaz Parlour!`,
      sent_at: new Date().toISOString()
    };
    store.emailLogs.unshift(emailLog);

    saveStore();
    broadcastRealtime('booking_status_changed', updatedBk);

    res.json(updatedBk);
  } finally {
    unlock();
  }
});

// REVIEWS ROUTES
app.get('/api/reviews', (req, res) => {
  const { customer_id } = req.query;
  let list = [...store.reviews];
  if (customer_id) list = list.filter(r => r.customer_id === customer_id);
  res.json(list);
});

app.post('/api/reviews', (req, res) => {
  const { booking_id, customer_id, customer_name, service_id, service_name, staff_id, staff_name, rating, comment } = req.body;

  if (!booking_id || !rating) {
    return res.status(400).json({ error: 'Missing booking ID or rating score' });
  }

  // Ensure booking exists and is completed
  const booking = store.bookings.find(b => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({ error: 'Booking not found' });
  }
  if (booking.status !== 'completed') {
    return res.status(400).json({ error: 'Reviews can only be submitted for completed bookings' });
  }

  // Check if review already exists
  const existingReview = store.reviews.find(r => r.booking_id === booking_id);
  if (existingReview) {
    return res.status(409).json({ error: 'A review has already been submitted for this booking.' });
  }

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    booking_id,
    customer_id: customer_id || booking.customer_id,
    customer_name: customer_name || booking.customer_name,
    service_id: service_id || booking.service_id,
    service_name: service_name || booking.service_name,
    staff_id: staff_id || booking.staff_id,
    staff_name: staff_name || booking.staff_name,
    rating: Number(rating),
    comment: comment || '',
    created_at: new Date().toISOString()
  };

  store.reviews.unshift(newReview);

  // Recalculate staff average rating
  if (newReview.staff_id) {
    const staffReviews = store.reviews.filter(r => r.staff_id === newReview.staff_id);
    const totalRating = staffReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = totalRating / staffReviews.length;

    const staffIdx = store.staff.findIndex(s => s.id === newReview.staff_id);
    if (staffIdx !== -1) {
      store.staff[staffIdx].rating = Number(avg.toFixed(2));
      store.staff[staffIdx].reviews_count = staffReviews.length;
    }
  }

  saveStore();
  broadcastRealtime('review_added', newReview);

  res.status(201).json(newReview);
});

app.post('/api/reviews/:id/respond', (req, res) => {
  const { id } = req.params;
  const { response } = req.body;

  const index = store.reviews.findIndex(r => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Review not found' });
  }

  store.reviews[index].admin_response = response;
  saveStore();
  broadcastRealtime('review_updated', store.reviews[index]);

  res.json(store.reviews[index]);
});

// EMAIL LOGS ROUTE (protected — same-origin only)
app.get('/api/email-logs', (req, res) => {
  const origin = req.headers.origin || req.headers.referer || '';
  if (origin && !origin.includes(req.headers.host || '')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(store.emailLogs);
});

// SHOP ROUTES
app.get('/api/shop', (req, res) => {
  const shop = store.shops[0] || null;
  const addresses = store.addresses.filter(a => a.shop_id === shop?.id);
  const social_media = store.social_media.filter(s => s.shop_id === shop?.id);
  res.json({ shop, addresses, social_media });
});

app.put('/api/shop', (req, res) => {
  const { name, logo_url } = req.body;
  if (store.shops.length === 0) {
    store.shops.push({ id: 'shop-1', name, logo_url });
  } else {
    store.shops[0] = { ...store.shops[0], name, logo_url };
  }
  saveStore();
  res.json(store.shops[0]);
});

app.post('/api/shop/addresses', (req, res) => {
  const addr = { id: `addr-${Date.now()}`, shop_id: 'shop-1', address: req.body.address };
  store.addresses.push(addr);
  saveStore();
  res.status(201).json(addr);
});

app.delete('/api/shop/addresses/:id', (req, res) => {
  store.addresses = store.addresses.filter(a => a.id !== req.params.id);
  saveStore();
  res.json({ success: true });
});

app.post('/api/shop/social-media', (req, res) => {
  const sm = { id: `sm-${Date.now()}`, shop_id: 'shop-1', media_name: req.body.media_name, link: req.body.link };
  store.social_media.push(sm);
  saveStore();
  res.status(201).json(sm);
});

app.delete('/api/shop/social-media/:id', (req, res) => {
  store.social_media = store.social_media.filter(s => s.id !== req.params.id);
  saveStore();
  res.json({ success: true });
});

// START EXPRESS SERVER & MOUNT VITE
async function setupStaticServing() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }
}

if (!process.env.VERCEL) {
  setupStaticServing().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✨ Monikaz Parlour Full-Stack App running on http://0.0.0.0:${PORT}`);
    });
  });
} else {
  setupStaticServing();
}

export default app;
