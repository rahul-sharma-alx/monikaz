import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { INITIAL_SERVICES, INITIAL_STAFF, INITIAL_BOOKINGS, INITIAL_REVIEWS, INITIAL_PROFILES } from './src/data/initialData';
import { Service, Staff, Booking, Review, Profile } from './src/types';

const PORT = 3000;
const app = express();

app.use(express.json());

// In-Memory & File Store Persistence
const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'store.json');

interface AppStore {
  services: Service[];
  staff: Staff[];
  bookings: Booking[];
  reviews: Review[];
  profiles: Profile[];
  emailLogs: { id: string; to: string; subject: string; body: string; sent_at: string }[];
}

let store: AppStore = {
  services: [...INITIAL_SERVICES],
  staff: [...INITIAL_STAFF],
  bookings: [...INITIAL_BOOKINGS],
  reviews: [...INITIAL_REVIEWS],
  profiles: [...INITIAL_PROFILES],
  emailLogs: []
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
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store:', err);
  }
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
// REALTIME SSE ENDPOINT
// -------------------------------------------------------------
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  // Send initial ping
  res.write(`event: init\ndata: ${JSON.stringify({ message: 'Connected to Monikaz Parlour Realtime Stream' })}\n\n`);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// -------------------------------------------------------------
// API ROUTES
// -------------------------------------------------------------

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Monikaz Parlour API', time: new Date().toISOString() });
});

app.get('/api/initial-data', (req, res) => {
  res.json(store);
});

// SERVICE ROUTES
app.get('/api/services', (req, res) => {
  res.json(store.services);
});

app.post('/api/services', (req, res) => {
  const newService: Service = {
    id: `srv-${Date.now()}`,
    ...req.body,
    is_active: req.body.is_active ?? true,
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
  store.services[index] = { ...store.services[index], ...req.body };
  saveStore();
  broadcastRealtime('service_updated', { action: 'updated', service: store.services[index] });
  res.json(store.services[index]);
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
  const newStaff: Staff = {
    id: `stf-${Date.now()}`,
    ...req.body,
    is_active: req.body.is_active ?? true,
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
  store.staff[index] = { ...store.staff[index], ...req.body };
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

app.post('/api/bookings', (req, res) => {
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
  } = req.body;

  if (!service_id || !booking_date || !start_time || !end_time) {
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
});

app.patch('/api/bookings/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const index = store.bookings.findIndex(b => b.id === id);
  if (index === -1) {
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
});

// REVIEWS ROUTES
app.get('/api/reviews', (req, res) => {
  res.json(store.reviews);
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

// EMAIL LOGS ROUTE
app.get('/api/email-logs', (req, res) => {
  res.json(store.emailLogs);
});

// START EXPRESS SERVER & MOUNT VITE
async function start() {
  if (process.env.NODE_ENV !== 'production') {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ Monikaz Parlour Full-Stack App running on http://0.0.0.0:${PORT}`);
  });
}

start();
