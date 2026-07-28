-- UPDATE profiles
-- SET role = 'admin'
-- WHERE email = 'monikaz@gmail.com';

-- Monikaz Parlour — Supabase Migration
-- Safe to re-run. Uses IF NOT EXISTS / ON CONFLICT DO NOTHING everywhere.
-- Does NOT drop existing tables, so existing data is preserved.

-- 1. PROFILES (id matches auth.users.id from Google OAuth etc.)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role text not null default 'customer' check (role in ('customer','staff','manager','admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. SERVICES
create table if not exists public.services (
  id text primary key,
  name text not null,
  description text,
  price numeric(10,2) not null,
  duration_minutes int not null,
  category text not null,
  image_url text,
  is_active boolean default true,
  discount_percent int default 0,
  created_at timestamptz default now()
);

-- 3. STAFF
create table if not exists public.staff (
  id text primary key,
  full_name text not null,
  bio text,
  specialties text[],
  photo_url text,
  is_active boolean default true,
  role text,
  email text,
  phone text,
  permissions text[],
  rating numeric(3,2) default 5.0,
  reviews_count int default 0,
  created_at timestamptz default now()
);

-- 4. BOOKINGS
create table if not exists public.bookings (
  id text primary key,
  customer_id text not null,
  customer_name text not null,
  customer_phone text,
  customer_email text,
  service_id text not null,
  service_name text,
  service_price numeric(10,2),
  service_duration int,
  staff_id text,
  staff_name text,
  booking_date date not null,
  start_time time not null,
  end_time time not null,
  status text not null default 'pending' check (status in ('pending','confirmed','in_progress','completed','cancelled','no_show')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. REVIEWS
create table if not exists public.reviews (
  id text primary key,
  booking_id text unique not null,
  customer_id text not null,
  customer_name text,
  service_id text,
  service_name text,
  staff_id text,
  staff_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  admin_response text,
  created_at timestamptz default now()
);

-- 6. SHOPS
create table if not exists public.shops (
  id text primary key default 'shop-1',
  name text not null,
  logo_url text
);

-- 7. ADDRESSES
create table if not exists public.addresses (
  id text primary key,
  shop_id text not null references public.shops(id) on delete cascade,
  address text not null
);

-- 8. SOCIAL MEDIA
create table if not exists public.social_media (
  id text primary key,
  shop_id text not null references public.shops(id) on delete cascade,
  media_name text not null check (media_name in ('instagram','facebook','whatsapp')),
  link text not null
);

-- Price history table for tracking discount/price changes
create table if not exists public.price_history (
  id text primary key,
  service_id text not null references public.services(id) on delete cascade,
  shop_id text references public.shops(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  price numeric(10,2) not null,
  discount_percent int not null default 0,
  after_discount numeric(10,2) not null,
  changed_at timestamptz not null default now()
);

-- ── ROW LEVEL SECURITY ──
-- ponytail: fully permissive for MVP — the app code enforces business rules.

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;
alter table public.shops enable row level security;
alter table public.addresses enable row level security;
alter table public.social_media enable row level security;

-- Ensure RLS is enabled (keep your ALTER TABLEs above as-is)

DO $$
BEGIN
  -- PROFILES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_read'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_read ON public.profiles FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_insert'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_insert ON public.profiles FOR INSERT WITH CHECK (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='profiles' AND policyname='profiles_update'
  ) THEN
    EXECUTE 'CREATE POLICY profiles_update ON public.profiles FOR UPDATE USING (auth.uid() = id);';
  END IF;

  -- SERVICES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='services' AND policyname='services_read'
  ) THEN
    EXECUTE 'CREATE POLICY services_read ON public.services FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='services' AND policyname='services_write'
  ) THEN
    EXECUTE 'CREATE POLICY services_write ON public.services FOR ALL USING (true);';
  END IF;

  -- STAFF
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='staff' AND policyname='staff_read'
  ) THEN
    EXECUTE 'CREATE POLICY staff_read ON public.staff FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='staff' AND policyname='staff_write'
  ) THEN
    EXECUTE 'CREATE POLICY staff_write ON public.staff FOR ALL USING (true);';
  END IF;

  -- BOOKINGS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='bookings' AND policyname='bookings_all'
  ) THEN
    EXECUTE 'CREATE POLICY bookings_all ON public.bookings FOR ALL USING (true) WITH CHECK (true);';
  END IF;

  -- REVIEWS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='reviews' AND policyname='reviews_all'
  ) THEN
    EXECUTE 'CREATE POLICY reviews_all ON public.reviews FOR ALL USING (true) WITH CHECK (true);';
  END IF;

  -- SHOPS
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='shops' AND policyname='shops_read'
  ) THEN
    EXECUTE 'CREATE POLICY shops_read ON public.shops FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='shops' AND policyname='shops_write'
  ) THEN
    EXECUTE 'CREATE POLICY shops_write ON public.shops FOR ALL USING (true);';
  END IF;

  -- ADDRESSES
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='addresses' AND policyname='addresses_read'
  ) THEN
    EXECUTE 'CREATE POLICY addresses_read ON public.addresses FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='addresses' AND policyname='addresses_write'
  ) THEN
    EXECUTE 'CREATE POLICY addresses_write ON public.addresses FOR ALL USING (true);';
  END IF;

  -- SOCIAL MEDIA
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_media' AND policyname='social_media_read'
  ) THEN
    EXECUTE 'CREATE POLICY social_media_read ON public.social_media FOR SELECT USING (true);';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='social_media' AND policyname='social_media_write'
  ) THEN
    EXECUTE 'CREATE POLICY social_media_write ON public.social_media FOR ALL USING (true);';
  END IF;
END $$;

-- ── SEED DATA ──

insert into public.services (id, name, description, price, duration_minutes, category, image_url, is_active) values
  ('srv-1', 'Keratin & Gloss Hair Treatment', 'Deep hair repair with organic keratin. Makes hair silky, smooth and frizz-free for up to 4 months.', 1800, 90, 'Hair & Styling', 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800', true),
  ('srv-2', 'Balayage & Hair Colouring', 'Hand-painted highlights customised for your skin tone and hair length. Natural looking colour.', 2200, 120, 'Hair & Styling', 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800', true),
  ('srv-3', '24K Gold Glow Facial', 'Luxury facial with real 24K gold foil, hyaluronic serum and LED therapy. Gives instant glow.', 1500, 75, 'Facial & Skincare', 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800', true),
  ('srv-4', 'Deep Clean Hydra Facial', 'Multi-step deep cleansing facial with suction, exfoliation, and antioxidant hydration.', 1250, 60, 'Facial & Skincare', 'https://images.unsplash.com/photo-1512290900673-70020083049b?auto=format&fit=crop&q=80&w=800', true),
  ('srv-5', 'Gel Manicure & Pedicure Combo', 'Complete nail shaping, cuticle care, sugar scrub massage and long-lasting gel polish.', 950, 60, 'Nails & Hands', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800', true),
  ('srv-6', 'Bridal Makeup & Hair Styling', 'Complete bridal package with HD makeup, mink lashes, hair styling and jewellery fitting.', 3500, 150, 'Makeup & Bridal', 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800', true),
  ('srv-7', 'Aromatherapy Body Massage', 'Deep tissue massage with essential oils to release body tension and calm your mind.', 1400, 80, 'Body Spa', 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800', true)
on conflict (id) do nothing;

insert into public.staff (id, full_name, bio, specialties, photo_url, is_active, role, email, phone, rating, reviews_count) values
  ('stf-1', 'Monika Sharma', 'Founder & Senior Hair Stylist with 14+ years experience in Balayage, Keratin and bridal hairstyles.', array['Balayage & Hair Colour','Keratin Treatment','Bridal Hair'], 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400', true, 'admin', 'monika@monikazparlour.com', '+91 98765 00000', 4.9, 48),
  ('stf-2', 'Aisha Patel', 'Senior Skin Specialist & Parlour Manager. Expert in Gold facials, anti-aging and sensitive skin care.', array['24K Gold Facial','Hydra Facial','Chemical Peel'], 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400', true, 'manager', 'aisha.p@monikazparlour.com', '+91 98765 11111', 4.95, 39),
  ('stf-3', 'Neha Kapoor', 'Master Nail Artist specialising in gel extensions, nail art, Russian manicure and hand spa.', array['Gel Manicure','Nail Art','Russian Manicure'], 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400', true, 'staff', 'neha.k@monikazparlour.com', '+91 98765 22222', 4.88, 27),
  ('stf-4', 'Ananya Verma', 'Celebrity Makeup Artist. Expert in HD airbrush, bridal makeup, natural glow and party looks.', array['Bridal Makeup','Airbrush Makeup','Evening Glam'], 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400', true, 'staff', 'ananya.v@monikazparlour.com', '+91 98765 33333', 5.0, 32),
  ('stf-5', 'Priya Nair', 'Certified Spa & Body Therapist. Specialises in deep tissue massage, aromatherapy and Ayurvedic treatments.', array['Deep Tissue Massage','Aromatherapy','Body Scrub'], 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400', true, 'staff', 'priya.n@monikazparlour.com', '+91 98765 44444', 4.92, 21)
on conflict (id) do nothing;

insert into public.shops (id, name, logo_url) values
  ('shop-1', 'Monikaz Parlour', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200')
on conflict (id) do nothing;

insert into public.addresses (id, shop_id, address) values
  ('addr-1', 'shop-1', '123, Linking Road, Bandra West, Mumbai - 400050')
on conflict (id) do nothing;

insert into public.social_media (id, shop_id, media_name, link) values
  ('sm-1', 'shop-1', 'instagram', 'https://instagram.com/monikazparlour'),
  ('sm-2', 'shop-1', 'facebook', 'https://facebook.com/monikazparlour')
on conflict (id) do nothing;

-- Enable Realtime for live status updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'bookings'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename  = 'reviews'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews';
  END IF;
END $$;
