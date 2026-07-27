import { Service, Staff, Booking, Review, Profile } from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-c1',
    full_name: 'Sophia Williams',
    phone: '+1 (555) 234-5678',
    email: 'sophia.w@example.com',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'user-a1',
    full_name: 'Monika Sharma (Owner)',
    phone: '+1 (555) 999-0000',
    email: 'monika@monikazparlour.com',
    role: 'admin',
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 365 * 86400000).toISOString()
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Monikaz Royal Hair Keratin & Gloss',
    description: 'Deep hair reconstruction treatment using organic keratin, leaving hair silky smooth, frizz-free, and brilliantly shiny for up to 4 months.',
    price: 180,
    duration_minutes: 90,
    category: 'Hair & Styling',
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-2',
    name: 'Balayage & Couture Colouring',
    description: 'Hand-painted dimensional hair highlighting custom tailored to your skin tone and hair length, finished with a hydrating gloss.',
    price: 220,
    duration_minutes: 120,
    category: 'Hair & Styling',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-3',
    name: 'Signature 24K Gold Glow Facial',
    description: 'Ultra-luxurious cellular rejuvenation facial incorporating 24K gold foil flakes, hyaluronic serum, ultrasonic cleansing, and LED therapy.',
    price: 150,
    duration_minutes: 75,
    category: 'Facial & Skincare',
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-4',
    name: 'Hydra-Infusion Deep Cleansing Facial',
    description: 'Multi-step vortex suction cleansing, mild salicylic exfoliation, and intense antioxidant hydration lock for clear, glowing skin.',
    price: 125,
    duration_minutes: 60,
    category: 'Facial & Skincare',
    image_url: 'https://images.unsplash.com/photo-1512290900673-70020083049b?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-5',
    name: 'Luxury Gel Spa Manicure & Pedicure',
    description: 'Complete nail shaping, cuticle nourishment, botanical sugar scrub scrub massage, and long-lasting non-chip gel polish application.',
    price: 95,
    duration_minutes: 60,
    category: 'Nails & Hands',
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-6',
    name: 'Couture Bridal Glam & Hair Styling',
    description: 'Complete HD bridal makeup package including airbrush foundation, mink lash extensions, hair sculpting, and jewelry styling consultation.',
    price: 350,
    duration_minutes: 150,
    category: 'Makeup & Bridal',
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-7',
    name: 'Deep Tissue Aromatherapy Body Spa',
    description: 'Therapeutic pressure massage using custom essential oils to release deep muscular tension, promote lymphatic flow, and calm the senses.',
    price: 140,
    duration_minutes: 80,
    category: 'Body Spa',
    image_url: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_STAFF: Staff[] = [
  {
    id: 'stf-1',
    full_name: 'Monika Sharma',
    bio: 'Founder & Creative Director with 14+ years of international hair styling experience. Specialist in Balayage, Keratin, and Bridal Transformations.',
    specialties: ['Balayage & Hair Colour', 'Keratin Treatments', 'Bridal Hair'],
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    rating: 4.9,
    reviews_count: 48
  },
  {
    id: 'stf-2',
    full_name: 'Aisha Patel',
    bio: 'Licensed Senior Medical Esthetician and Skincare Guru. Passionate about 24K Gold facials, anti-aging therapies, and sensitive skin restoration.',
    specialties: ['24K Gold Facial', 'Hydra Facials', 'Chemical Peels'],
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    rating: 4.95,
    reviews_count: 39
  },
  {
    id: 'stf-3',
    full_name: 'Elena Rostova',
    bio: 'Master Nail Artist certified in Russian manicures, custom gel extensions, 3D nail art, and restorative hand spa treatments.',
    specialties: ['Gel Spa Manicure', 'Acrylic Nail Art', 'Russian Manicure'],
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    rating: 4.88,
    reviews_count: 27
  },
  {
    id: 'stf-4',
    full_name: 'Sophia Rivera',
    bio: 'Celebrity Makeup Artist with expertise in HD airbrushing, red-carpet glam, subtle natural glow looks, and bridal party styling.',
    specialties: ['Couture Bridal Glam', 'Airbrush Makeup', 'Evening Glam'],
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    rating: 5.0,
    reviews_count: 32
  },
  {
    id: 'stf-5',
    full_name: 'Priya Nair',
    bio: 'Certified Holistic Spa & Body Therapist specializing in Deep Tissue Aromatherapy, Ayurvedic massage, and herbal body polished scrubs.',
    specialties: ['Deep Tissue Spa', 'Aromatherapy Massage', 'Body Scrubs'],
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    rating: 4.92,
    reviews_count: 21
  }
];

export const getTodayString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_BOOKINGS: Booking[] = [
  {
    id: 'bk-101',
    customer_id: 'user-c1',
    customer_name: 'Sophia Williams',
    customer_phone: '+1 (555) 234-5678',
    customer_email: 'sophia.w@example.com',
    service_id: 'srv-3',
    service_name: 'Signature 24K Gold Glow Facial',
    service_price: 150,
    service_duration: 75,
    staff_id: 'stf-2',
    staff_name: 'Aisha Patel',
    booking_date: getTodayString(0),
    start_time: '11:00',
    end_time: '12:15',
    status: 'in_progress',
    notes: 'Please use extra sensitive skin moisturizer.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'bk-102',
    customer_id: 'user-c1',
    customer_name: 'Sophia Williams',
    customer_phone: '+1 (555) 234-5678',
    customer_email: 'sophia.w@example.com',
    service_id: 'srv-1',
    service_name: 'Monikaz Royal Hair Keratin & Gloss',
    service_price: 180,
    service_duration: 90,
    staff_id: 'stf-1',
    staff_name: 'Monika Sharma',
    booking_date: getTodayString(1),
    start_time: '14:00',
    end_time: '15:30',
    status: 'confirmed',
    notes: 'Preparing for an anniversary party!',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'bk-103',
    customer_id: 'user-c2',
    customer_name: 'Emma Thompson',
    customer_phone: '+1 (555) 876-5432',
    customer_email: 'emma.t@example.com',
    service_id: 'srv-5',
    service_name: 'Luxury Gel Spa Manicure & Pedicure',
    service_price: 95,
    service_duration: 60,
    staff_id: 'stf-3',
    staff_name: 'Elena Rostova',
    booking_date: getTodayString(-2),
    start_time: '15:00',
    end_time: '16:00',
    status: 'completed',
    notes: 'Rose pink gel shade preferred.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'bk-104',
    customer_id: 'user-c3',
    customer_name: 'Isabella Vance',
    customer_phone: '+1 (555) 345-6789',
    customer_email: 'isabella.vance@example.com',
    service_id: 'srv-6',
    service_name: 'Couture Bridal Glam & Hair Styling',
    service_price: 350,
    service_duration: 150,
    staff_id: 'stf-4',
    staff_name: 'Sophia Rivera',
    booking_date: getTodayString(3),
    start_time: '10:00',
    end_time: '12:30',
    status: 'pending',
    notes: 'Bridal trial booking.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    booking_id: 'bk-103',
    customer_id: 'user-c2',
    customer_name: 'Emma Thompson',
    service_id: 'srv-5',
    service_name: 'Luxury Gel Spa Manicure & Pedicure',
    staff_id: 'stf-3',
    staff_name: 'Elena Rostova',
    rating: 5,
    comment: 'Elena is an incredible nail artist! My manicure lasted over 3 weeks without a single chip. The spa hand massage was pure relaxation.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_response: 'Thank you so much Emma! We look forward to pampering you again soon!'
  },
  {
    id: 'rev-2',
    booking_id: 'bk-099',
    customer_id: 'user-c4',
    customer_name: 'Olivia Martinez',
    service_id: 'srv-1',
    service_name: 'Monikaz Royal Hair Keratin & Gloss',
    staff_id: 'stf-1',
    staff_name: 'Monika Sharma',
    rating: 5,
    comment: 'Monika transformed my dry, frizzy hair into liquid silk! The salon atmosphere is so welcoming and luxurious.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const SUPABASE_SQL_SCHEMA = `-- MONIKAZ PARLOUR - FULL SUPABASE POSTGRES SCHEMA & RLS POLICIES

-- 1. Profiles Table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  role text not null default 'customer' check (role in ('customer','admin')),
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Services Table
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

-- 3. Staff Table
create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  bio text,
  specialties text[],
  photo_url text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- 4. Bookings Table
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

-- 5. Reviews Table
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

-- ROW LEVEL SECURITY (RLS) POLICIES

alter table public.profiles enable row level security;
alter table public.services enable row level security;
alter table public.staff enable row level security;
alter table public.bookings enable row level security;
alter table public.reviews enable row level security;

-- Profiles Policies
create policy "Public Profiles Read" on public.profiles for select using (true);
create policy "Users Update Own Profile" on public.profiles for update using (auth.uid() = id);

-- Services Policies
create policy "Public Services Read" on public.services for select using (is_active = true or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Admin Services Write" on public.services for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Staff Policies
create policy "Public Staff Read" on public.staff for select using (true);
create policy "Admin Staff Write" on public.staff for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Bookings Policies
create policy "Customer View Own Bookings" on public.bookings for select using (customer_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Customer Insert Bookings" on public.bookings for insert with check (customer_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "Customer Update Own Bookings" on public.bookings for update using (customer_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Reviews Policies
create policy "Public Reviews Read" on public.reviews for select using (true);
create policy "Customer Insert Review for Completed Booking" on public.reviews for insert with check (
  customer_id = auth.uid() and exists (
    select 1 from public.bookings where id = booking_id and customer_id = auth.uid() and status = 'completed'
  )
);
create policy "Admin Manage Reviews" on public.reviews for update using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Enable Realtime
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.reviews;
`;
