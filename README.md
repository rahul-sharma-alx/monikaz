# Monikazz Salon & Academy — Luxury Salon & Beauty Booking Web Application

Monikazz Salon & Academy is a full-stack salon & beauty academy booking web application built with React, TypeScript, Tailwind CSS, Express, and Supabase / Postgres integration.

---

## 🌟 Key Features

- **Multi-Role Experience**:
  - **Customer**: Browse service menu, view stylist bios & ratings, complete multi-step online booking, track appointment status in real-time, cancel/reschedule with 3-hour cutoff rule, and rate completed sessions.
  - **Admin / Owner**: Manage live appointment calendar, double-booking validation, update booking statuses (`pending → confirmed → in_progress → completed → cancelled`), CRUD operations for services and staff, reply to customer feedback, and export Supabase DDL SQL schema.
- **Real-Time Synchronisation**: Uses Server-Sent Events (SSE) and Supabase Realtime channels so status updates (e.g. marking "In Progress") update live on customer screens.
- **Double-Booking Prevention**: Server-side time overlap validation ensures no staff member is double-booked for the same date and time.
- **Simulated & Resend Email Confirmations**: Automatically generates confirmation email logs upon booking reservation and status updates.
- **Elegant Aesthetic**: Warm champagne and rose gold luxury styling, serif typography, responsive mobile-first navigation drawer, and accessibility.

---

## 🗄️ Database Schema & Row Level Security (Supabase)

Execute the following SQL script inside your Supabase project's **SQL Editor**:

```sql
-- Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- Services Table
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_minutes int not null,
  category text not null,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Staff Table
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  bio text,
  specialties text[],
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Bookings Table
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references public.profiles(id) not null,
  service_id uuid references public.services(id) not null,
  staff_id uuid references public.staff(id),
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending'
    check (status in ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Reviews Table
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id) unique not null,
  customer_id uuid references public.profiles(id) not null,
  service_id uuid references public.services(id),
  staff_id uuid references public.staff(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  admin_response text,
  created_at timestamptz default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

create policy "Public Services Read" on public.services for select using (true);
create policy "Public Staff Read" on public.staff for select using (true);
create policy "Customer View Own Bookings" on public.bookings for select using (true);
```

---

## 🚀 Setup & Local Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Add your Supabase project URL and Anon Key:
   ```env
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```

3. **Run Development Server**:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

---

## 🚢 Deployment (Vercel / Netlify / Cloud Run)

### Vercel / Netlify Deployment:
1. Push code to GitHub repository.
2. Connect repository in Vercel or Netlify dashboard.
3. Add environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Set build command to `npm run build` and publish directory to `dist`.

### Docker / Cloud Run Deployment:
1. Build application: `npm run build`
2. Start server: `npm start`
