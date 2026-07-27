// server.ts
import express from "express";
import path from "path";
import fs from "fs";

// src/data/initialData.ts
var INITIAL_PROFILES = [
  {
    id: "user-c1",
    full_name: "Priya Sharma",
    phone: "+91 98765 43210",
    email: "priya.sharma@email.com",
    role: "customer",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    created_at: new Date(Date.now() - 30 * 864e5).toISOString()
  },
  {
    id: "user-m1",
    full_name: "Aisha Patel (Manager)",
    phone: "+91 98765 11111",
    email: "aisha.p@monikazparlour.com",
    role: "manager",
    permissions: ["view_analytics", "manage_bookings", "manage_services", "manage_staff", "manage_reviews"],
    avatar_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300",
    created_at: new Date(Date.now() - 180 * 864e5).toISOString()
  },
  {
    id: "user-s1",
    full_name: "Neha Kapoor (Staff)",
    phone: "+91 98765 22222",
    email: "neha.k@monikazparlour.com",
    role: "staff",
    permissions: ["manage_bookings", "manage_reviews"],
    avatar_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300",
    created_at: new Date(Date.now() - 120 * 864e5).toISOString()
  },
  {
    id: "user-a1",
    full_name: "Monika Sharma (Owner & Admin)",
    phone: "+91 98765 00000",
    email: "monika@monikazparlour.com",
    role: "admin",
    permissions: ["view_analytics", "manage_bookings", "manage_services", "manage_staff", "manage_reviews", "manage_permissions"],
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    created_at: new Date(Date.now() - 365 * 864e5).toISOString()
  }
];
var INITIAL_SERVICES = [
  {
    id: "srv-1",
    name: "Keratin & Gloss Hair Treatment",
    description: "Deep hair repair with organic keratin. Makes hair silky, smooth and frizz-free for up to 4 months. Perfect for unmanageable hair.",
    price: 1800,
    duration_minutes: 90,
    category: "Hair & Styling",
    image_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-2",
    name: "Balayage & Hair Colouring",
    description: "Hand-painted highlights customised for your skin tone and hair length. Natural looking colour that grows out beautifully.",
    price: 2200,
    duration_minutes: 120,
    category: "Hair & Styling",
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-3",
    name: "24K Gold Glow Facial",
    description: "Luxury facial with real 24K gold foil, hyaluronic serum and LED therapy. Gives instant glow and tightens skin.",
    price: 1500,
    duration_minutes: 75,
    category: "Facial & Skincare",
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-4",
    name: "Deep Clean Hydra Facial",
    description: "Multi-step deep cleansing facial with suction, salicylic exfoliation and antioxidant hydration. Leaves skin clear and glowing.",
    price: 1250,
    duration_minutes: 60,
    category: "Facial & Skincare",
    image_url: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-5",
    name: "Gel Manicure & Pedicure Combo",
    description: "Complete nail shaping, cuticle care, sugar scrub massage and long-lasting gel polish for both hands and feet.",
    price: 950,
    duration_minutes: 60,
    category: "Nails & Hands",
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-6",
    name: "Bridal Makeup & Hair Styling",
    description: "Complete bridal package with HD makeup, mink lashes, hair styling and jewellery fitting. Get ready for your big day with us.",
    price: 3500,
    duration_minutes: 150,
    category: "Makeup & Bridal",
    image_url: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  },
  {
    id: "srv-7",
    name: "Aromatherapy Body Massage",
    description: "Deep tissue massage with essential oils to release body tension, improve blood flow and calm your mind. Full body relaxation.",
    price: 1400,
    duration_minutes: 80,
    category: "Body Spa",
    image_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800",
    is_active: true,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  }
];
var INITIAL_STAFF = [
  {
    id: "stf-1",
    full_name: "Monika Sharma",
    bio: "Founder & Senior Hair Stylist with 14+ years experience. Expert in Balayage, Keratin treatments and bridal hairstyles.",
    specialties: ["Balayage & Hair Colour", "Keratin Treatment", "Bridal Hair"],
    photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400",
    is_active: true,
    role: "admin",
    email: "monika@monikazparlour.com",
    phone: "+91 98765 00000",
    permissions: ["view_analytics", "manage_bookings", "manage_services", "manage_staff", "manage_reviews", "manage_permissions"],
    rating: 4.9,
    reviews_count: 48
  },
  {
    id: "stf-2",
    full_name: "Aisha Patel",
    bio: "Senior Skin Specialist & Parlour Manager. Expert in 24K Gold facials, anti-aging treatments and sensitive skin care.",
    specialties: ["24K Gold Facial", "Hydra Facial", "Chemical Peel"],
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400",
    is_active: true,
    role: "manager",
    email: "aisha.p@monikazparlour.com",
    phone: "+91 98765 11111",
    permissions: ["view_analytics", "manage_bookings", "manage_services", "manage_staff", "manage_reviews"],
    rating: 4.95,
    reviews_count: 39
  },
  {
    id: "stf-3",
    full_name: "Neha Kapoor",
    bio: "Master Nail Artist. Specialises in gel extensions, nail art, Russian manicure and hand spa treatments.",
    specialties: ["Gel Manicure", "Nail Art", "Russian Manicure"],
    photo_url: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400",
    is_active: true,
    role: "staff",
    email: "neha.k@monikazparlour.com",
    phone: "+91 98765 22222",
    permissions: ["manage_bookings", "manage_reviews"],
    rating: 4.88,
    reviews_count: 27
  },
  {
    id: "stf-4",
    full_name: "Ananya Verma",
    bio: "Celebrity Makeup Artist. Expert in HD airbrush, bridal makeup, natural glow looks and evening party glam.",
    specialties: ["Bridal Makeup", "Airbrush Makeup", "Evening Glam"],
    photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400",
    is_active: true,
    role: "staff",
    email: "ananya.v@monikazparlour.com",
    phone: "+91 98765 33333",
    permissions: ["manage_bookings"],
    rating: 5,
    reviews_count: 32
  },
  {
    id: "stf-5",
    full_name: "Priya Nair",
    bio: "Certified Spa & Body Therapist. Specialises in deep tissue massage, aromatherapy, Ayurvedic treatments and body scrubs.",
    specialties: ["Deep Tissue Massage", "Aromatherapy", "Body Scrub"],
    photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400",
    is_active: true,
    role: "staff",
    email: "priya.n@monikazparlour.com",
    phone: "+91 98765 44444",
    permissions: ["manage_bookings"],
    rating: 4.92,
    reviews_count: 21
  }
];
var getTodayString = (offsetDays = 0) => {
  const d = /* @__PURE__ */ new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
};
var INITIAL_BOOKINGS = [
  {
    id: "bk-101",
    customer_id: "user-c1",
    customer_name: "Priya Sharma",
    customer_phone: "+91 98765 43210",
    customer_email: "priya.sharma@email.com",
    service_id: "srv-3",
    service_name: "24K Gold Glow Facial",
    service_price: 1500,
    service_duration: 75,
    staff_id: "stf-2",
    staff_name: "Aisha Patel",
    booking_date: getTodayString(0),
    start_time: "11:00",
    end_time: "12:15",
    status: "in_progress",
    notes: "Please use gentle moisturiser, I have sensitive skin.",
    created_at: new Date(Date.now() - 36e5 * 4).toISOString(),
    updated_at: new Date(Date.now() - 18e5).toISOString()
  },
  {
    id: "bk-102",
    customer_id: "user-c1",
    customer_name: "Priya Sharma",
    customer_phone: "+91 98765 43210",
    customer_email: "priya.sharma@email.com",
    service_id: "srv-1",
    service_name: "Keratin & Gloss Hair Treatment",
    service_price: 1800,
    service_duration: 90,
    staff_id: "stf-1",
    staff_name: "Monika Sharma",
    booking_date: getTodayString(1),
    start_time: "14:00",
    end_time: "15:30",
    status: "confirmed",
    notes: "Getting ready for my sister wedding!",
    created_at: new Date(Date.now() - 36e5 * 24).toISOString(),
    updated_at: new Date(Date.now() - 36e5 * 24).toISOString()
  },
  {
    id: "bk-103",
    customer_id: "user-c2",
    customer_name: "Ananya Verma",
    customer_phone: "+91 98765 87654",
    customer_email: "ananya.v@email.com",
    service_id: "srv-5",
    service_name: "Gel Manicure & Pedicure Combo",
    service_price: 950,
    service_duration: 60,
    staff_id: "stf-3",
    staff_name: "Neha Kapoor",
    booking_date: getTodayString(-2),
    start_time: "15:00",
    end_time: "16:00",
    status: "completed",
    notes: "Rose pink gel shade preferred.",
    created_at: new Date(Date.now() - 864e5 * 3).toISOString(),
    updated_at: new Date(Date.now() - 864e5 * 2).toISOString()
  },
  {
    id: "bk-104",
    customer_id: "user-c3",
    customer_name: "Meera Iyer",
    customer_phone: "+91 98765 34567",
    customer_email: "meera.i@email.com",
    service_id: "srv-6",
    service_name: "Bridal Makeup & Hair Styling",
    service_price: 3500,
    service_duration: 150,
    staff_id: "stf-4",
    staff_name: "Ananya Verma",
    booking_date: getTodayString(3),
    start_time: "10:00",
    end_time: "12:30",
    status: "pending",
    notes: "Bridal trial for December wedding.",
    created_at: new Date(Date.now() - 36e5 * 2).toISOString(),
    updated_at: new Date(Date.now() - 36e5 * 2).toISOString()
  }
];
var INITIAL_REVIEWS = [
  {
    id: "rev-1",
    booking_id: "bk-103",
    customer_id: "user-c2",
    customer_name: "Ananya Verma",
    service_id: "srv-5",
    service_name: "Gel Manicure & Pedicure Combo",
    staff_id: "stf-3",
    staff_name: "Neha Kapoor",
    rating: 5,
    comment: "Neha is amazing! My manicure lasted 3 weeks without any chip. The hand massage was so relaxing.",
    created_at: new Date(Date.now() - 864e5 * 2).toISOString(),
    admin_response: "Thank you Ananya! Looking forward to seeing you again!"
  },
  {
    id: "rev-2",
    booking_id: "bk-099",
    customer_id: "user-c4",
    customer_name: "Kavita Reddy",
    service_id: "srv-1",
    service_name: "Keratin & Gloss Hair Treatment",
    staff_id: "stf-1",
    staff_name: "Monika Sharma",
    rating: 5,
    comment: "Monika transformed my dry frizzy hair into silky smooth! The salon is so clean and welcoming.",
    created_at: new Date(Date.now() - 864e5 * 5).toISOString()
  }
];
var INITIAL_SHOP = {
  id: "shop-1",
  name: "Monikaz Parlour",
  logo_url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200"
};
var INITIAL_ADDRESSES = [
  { id: "addr-1", shop_id: "shop-1", address: "123, Linking Road, Bandra West, Mumbai - 400050" }
];
var INITIAL_SOCIAL_MEDIA = [
  { id: "sm-1", shop_id: "shop-1", media_name: "instagram", link: "https://instagram.com/monikazparlour" },
  { id: "sm-2", shop_id: "shop-1", media_name: "facebook", link: "https://facebook.com/monikazparlour" }
];

// server.ts
var PORT = 3e3;
var app = express();
app.use(express.json());
var DATA_DIR = path.join(process.cwd(), "data");
var STORE_FILE = path.join(DATA_DIR, "store.json");
var TMP_FILE = path.join(DATA_DIR, "store.tmp");
var store = {
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
function loadStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_FILE)) {
      const data = fs.readFileSync(STORE_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (parsed.services && parsed.bookings) {
        store = { ...store, ...parsed };
      }
    } else {
      saveStore();
    }
  } catch (err) {
    console.warn("Store load warning, using initial in-memory data:", err);
  }
}
function saveStore() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TMP_FILE, JSON.stringify(store, null, 2), "utf-8");
    fs.renameSync(TMP_FILE, STORE_FILE);
  } catch (err) {
    console.error("Failed to save store:", err);
  }
}
var bookingLock = [];
async function acquireBookingLock() {
  let resolve;
  const promise = new Promise((r) => {
    resolve = r;
  });
  const entry = { promise, resolve };
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
var sseClients = [];
function broadcastRealtime(event, payload) {
  const data = `event: ${event}
data: ${JSON.stringify(payload)}

`;
  sseClients.forEach((client) => {
    try {
      client.write(data);
    } catch (e) {
    }
  });
}
if (!process.env.VERCEL) {
  app.get("/api/realtime/stream", (req, res) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();
    sseClients.push(res);
    res.write(`event: init
data: ${JSON.stringify({ message: "Connected to Monikaz Parlour Realtime Stream" })}

`);
    req.on("close", () => {
      sseClients = sseClients.filter((client) => client !== res);
    });
  });
}
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "Monikaz Parlour API", time: (/* @__PURE__ */ new Date()).toISOString() });
});
app.get("/api/services", (req, res) => {
  res.json(store.services);
});
app.post("/api/services", (req, res) => {
  const { name, description, price, duration_minutes, category, image_url, is_active, discount_percent } = req.body;
  const newService = {
    id: `srv-${Date.now()}`,
    name: name || "",
    description: description || "",
    price: Number(price) || 0,
    duration_minutes: Number(duration_minutes) || 60,
    category: category || "Hair & Styling",
    image_url: image_url || "",
    is_active: is_active ?? true,
    discount_percent: discount_percent ? Number(discount_percent) : void 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  store.services.unshift(newService);
  saveStore();
  broadcastRealtime("service_updated", { action: "created", service: newService });
  res.status(201).json(newService);
});
app.put("/api/services/:id", (req, res) => {
  const { id } = req.params;
  const index = store.services.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Service not found" });
  }
  const allowed = ["name", "description", "price", "duration_minutes", "category", "image_url", "is_active", "discount_percent", "updated_by"];
  for (const key of allowed) {
    if (key in req.body) {
      if (key === "price" || key === "duration_minutes" || key === "discount_percent") {
        store.services[index][key] = Number(req.body[key]);
      } else {
        store.services[index][key] = req.body[key];
      }
    }
  }
  const updated = store.services[index];
  store.priceHistory.unshift({
    id: `ph-${Date.now()}`,
    service_id: updated.id,
    shop_id: store.shops[0]?.id,
    updated_by: req.body.updated_by || void 0,
    price: updated.price,
    discount_percent: updated.discount_percent || 0,
    after_discount: updated.discount_percent ? Math.round(updated.price * (1 - updated.discount_percent / 100)) : updated.price,
    changed_at: (/* @__PURE__ */ new Date()).toISOString()
  });
  saveStore();
  broadcastRealtime("service_updated", { action: "updated", service: updated });
  res.json(updated);
});
app.get("/api/price-history", (req, res) => {
  res.json(store.priceHistory);
});
app.delete("/api/services/:id", (req, res) => {
  const { id } = req.params;
  store.services = store.services.filter((s) => s.id !== id);
  saveStore();
  broadcastRealtime("service_updated", { action: "deleted", id });
  res.json({ success: true, id });
});
app.get("/api/staff", (req, res) => {
  res.json(store.staff);
});
app.post("/api/staff", (req, res) => {
  const newStaff = {
    id: `stf-${Date.now()}`,
    ...req.body,
    is_active: req.body.is_active ?? true,
    rating: 5,
    reviews_count: 0,
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  store.staff.push(newStaff);
  saveStore();
  broadcastRealtime("staff_updated", { action: "created", staff: newStaff });
  res.status(201).json(newStaff);
});
app.put("/api/staff/:id", (req, res) => {
  const { id } = req.params;
  const index = store.staff.findIndex((s) => s.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Staff member not found" });
  }
  const allowed = ["full_name", "bio", "specialties", "photo_url", "is_active", "email", "phone", "permissions", "role"];
  const sanitized = {};
  for (const key of allowed) {
    if (key in req.body) sanitized[key] = req.body[key];
  }
  store.staff[index] = { ...store.staff[index], ...sanitized };
  saveStore();
  broadcastRealtime("staff_updated", { action: "updated", staff: store.staff[index] });
  res.json(store.staff[index]);
});
app.get("/api/bookings", (req, res) => {
  const { customer_id, staff_id, date, status } = req.query;
  let list = [...store.bookings];
  if (customer_id) {
    list = list.filter((b) => b.customer_id === customer_id);
  }
  if (staff_id) {
    list = list.filter((b) => b.staff_id === staff_id);
  }
  if (date) {
    list = list.filter((b) => b.booking_date === date);
  }
  if (status) {
    list = list.filter((b) => b.status === status);
  }
  res.json(list);
});
function timeToMinutes(t) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}
function isTimeOverlap(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  return Math.max(s1, s2) < Math.min(e1, e2);
}
app.post("/api/bookings", async (req, res) => {
  const unlock = await acquireBookingLock();
  try {
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
      unlock();
      return res.status(400).json({ error: "Missing required booking fields (service, date, or time)" });
    }
    if (staff_id) {
      const doubleBooked = store.bookings.find((b) => {
        if (b.status === "cancelled" || b.status === "no_show") return false;
        if (b.staff_id === staff_id && b.booking_date === booking_date) {
          return isTimeOverlap(start_time, end_time, b.start_time, b.end_time);
        }
        return false;
      });
      if (doubleBooked) {
        unlock();
        return res.status(409).json({
          error: `Stylist ${staff_name || "selected"} is already booked for ${doubleBooked.service_name} between ${doubleBooked.start_time} and ${doubleBooked.end_time} on ${booking_date}. Please pick another time slot or staff member.`
        });
      }
    }
    const newBooking = {
      id: `bk-${Date.now()}`,
      customer_id: customer_id || "user-c1",
      customer_name: customer_name || "Valued Customer",
      customer_phone: customer_phone || "",
      customer_email: customer_email || "customer@example.com",
      service_id,
      service_name: service_name || "Beauty Service",
      service_price: Number(service_price) || 0,
      service_duration: Number(service_duration) || 60,
      staff_id,
      staff_name: staff_name || "Any Available Stylist",
      booking_date,
      start_time,
      end_time,
      status: "pending",
      notes: notes || "",
      created_at: (/* @__PURE__ */ new Date()).toISOString(),
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.bookings.unshift(newBooking);
    const emailLog = {
      id: `email-${Date.now()}`,
      to: newBooking.customer_email,
      subject: `Booking Request Received - Monikaz Parlour (#${newBooking.id})`,
      body: `Hello ${newBooking.customer_name},

Your appointment for "${newBooking.service_name}" on ${newBooking.booking_date} at ${newBooking.start_time} with ${newBooking.staff_name} has been received and is currently Pending confirmation.

Thank you for choosing Monikaz Parlour!`,
      sent_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.emailLogs.unshift(emailLog);
    saveStore();
    broadcastRealtime("booking_created", newBooking);
    res.status(201).json(newBooking);
  } finally {
    unlock();
  }
});
app.patch("/api/bookings/:id/status", async (req, res) => {
  const unlock = await acquireBookingLock();
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ["pending", "confirmed", "in_progress", "completed", "cancelled", "no_show"];
    if (!validStatuses.includes(status)) {
      unlock();
      return res.status(400).json({ error: "Invalid status" });
    }
    const index = store.bookings.findIndex((b) => b.id === id);
    if (index === -1) {
      unlock();
      return res.status(404).json({ error: "Booking not found" });
    }
    store.bookings[index].status = status;
    store.bookings[index].updated_at = (/* @__PURE__ */ new Date()).toISOString();
    const updatedBk = store.bookings[index];
    const emailLog = {
      id: `email-${Date.now()}`,
      to: updatedBk.customer_email,
      subject: `Booking Status Update: ${status.toUpperCase()} - Monikaz Parlour`,
      body: `Hello ${updatedBk.customer_name},

Your appointment #${updatedBk.id} for "${updatedBk.service_name}" on ${updatedBk.booking_date} is now status: ${status}.

See you at Monikaz Parlour!`,
      sent_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    store.emailLogs.unshift(emailLog);
    saveStore();
    broadcastRealtime("booking_status_changed", updatedBk);
    res.json(updatedBk);
  } finally {
    unlock();
  }
});
app.get("/api/reviews", (req, res) => {
  const { customer_id } = req.query;
  let list = [...store.reviews];
  if (customer_id) list = list.filter((r) => r.customer_id === customer_id);
  res.json(list);
});
app.post("/api/reviews", (req, res) => {
  const { booking_id, customer_id, customer_name, service_id, service_name, staff_id, staff_name, rating, comment } = req.body;
  if (!booking_id || !rating) {
    return res.status(400).json({ error: "Missing booking ID or rating score" });
  }
  const booking = store.bookings.find((b) => b.id === booking_id);
  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (booking.status !== "completed") {
    return res.status(400).json({ error: "Reviews can only be submitted for completed bookings" });
  }
  const existingReview = store.reviews.find((r) => r.booking_id === booking_id);
  if (existingReview) {
    return res.status(409).json({ error: "A review has already been submitted for this booking." });
  }
  const newReview = {
    id: `rev-${Date.now()}`,
    booking_id,
    customer_id: customer_id || booking.customer_id,
    customer_name: customer_name || booking.customer_name,
    service_id: service_id || booking.service_id,
    service_name: service_name || booking.service_name,
    staff_id: staff_id || booking.staff_id,
    staff_name: staff_name || booking.staff_name,
    rating: Number(rating),
    comment: comment || "",
    created_at: (/* @__PURE__ */ new Date()).toISOString()
  };
  store.reviews.unshift(newReview);
  if (newReview.staff_id) {
    const staffReviews = store.reviews.filter((r) => r.staff_id === newReview.staff_id);
    const totalRating = staffReviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = totalRating / staffReviews.length;
    const staffIdx = store.staff.findIndex((s) => s.id === newReview.staff_id);
    if (staffIdx !== -1) {
      store.staff[staffIdx].rating = Number(avg.toFixed(2));
      store.staff[staffIdx].reviews_count = staffReviews.length;
    }
  }
  saveStore();
  broadcastRealtime("review_added", newReview);
  res.status(201).json(newReview);
});
app.post("/api/reviews/:id/respond", (req, res) => {
  const { id } = req.params;
  const { response } = req.body;
  const index = store.reviews.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Review not found" });
  }
  store.reviews[index].admin_response = response;
  saveStore();
  broadcastRealtime("review_updated", store.reviews[index]);
  res.json(store.reviews[index]);
});
app.get("/api/email-logs", (req, res) => {
  const origin = req.headers.origin || req.headers.referer || "";
  if (origin && !origin.includes(req.headers.host || "")) {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(store.emailLogs);
});
app.get("/api/shop", (req, res) => {
  const shop = store.shops[0] || null;
  const addresses = store.addresses.filter((a) => a.shop_id === shop?.id);
  const social_media = store.social_media.filter((s) => s.shop_id === shop?.id);
  res.json({ shop, addresses, social_media });
});
app.put("/api/shop", (req, res) => {
  const { name, logo_url } = req.body;
  if (store.shops.length === 0) {
    store.shops.push({ id: "shop-1", name, logo_url });
  } else {
    store.shops[0] = { ...store.shops[0], name, logo_url };
  }
  saveStore();
  res.json(store.shops[0]);
});
app.post("/api/shop/addresses", (req, res) => {
  const addr = { id: `addr-${Date.now()}`, shop_id: "shop-1", address: req.body.address };
  store.addresses.push(addr);
  saveStore();
  res.status(201).json(addr);
});
app.delete("/api/shop/addresses/:id", (req, res) => {
  store.addresses = store.addresses.filter((a) => a.id !== req.params.id);
  saveStore();
  res.json({ success: true });
});
app.post("/api/shop/social-media", (req, res) => {
  const sm = { id: `sm-${Date.now()}`, shop_id: "shop-1", media_name: req.body.media_name, link: req.body.link };
  store.social_media.push(sm);
  saveStore();
  res.status(201).json(sm);
});
app.delete("/api/shop/social-media/:id", (req, res) => {
  store.social_media = store.social_media.filter((s) => s.id !== req.params.id);
  saveStore();
  res.json({ success: true });
});
async function setupStaticServing() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}
if (!process.env.VERCEL) {
  setupStaticServing().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`\u2728 Monikaz Parlour Full-Stack App running on http://0.0.0.0:${PORT}`);
    });
  });
} else {
  setupStaticServing();
}
var server_default = app;
export {
  server_default as default
};
//# sourceMappingURL=index.js.map
