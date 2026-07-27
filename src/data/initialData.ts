import { Service, Staff, Booking, Review, Profile, Shop, Address, SocialMedia } from '../types';

export const INITIAL_PROFILES: Profile[] = [
  {
    id: 'user-c1',
    full_name: 'Priya Sharma',
    phone: '+91 98765 43210',
    email: 'priya.sharma@email.com',
    role: 'customer',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'user-m1',
    full_name: 'Aisha Patel (Manager)',
    phone: '+91 98765 11111',
    email: 'aisha.p@monikazparlour.com',
    role: 'manager',
    permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews'],
    avatar_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 180 * 86400000).toISOString()
  },
  {
    id: 'user-s1',
    full_name: 'Neha Kapoor (Staff)',
    phone: '+91 98765 22222',
    email: 'neha.k@monikazparlour.com',
    role: 'staff',
    permissions: ['manage_bookings', 'manage_reviews'],
    avatar_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 120 * 86400000).toISOString()
  },
  {
    id: 'user-a1',
    full_name: 'Monika Sharma (Owner & Admin)',
    phone: '+91 98765 00000',
    email: 'monika@monikazparlour.com',
    role: 'admin',
    permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews', 'manage_permissions'],
    avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300',
    created_at: new Date(Date.now() - 365 * 86400000).toISOString()
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Keratin & Gloss Hair Treatment',
    description: 'Deep hair repair with organic keratin. Makes hair silky, smooth and frizz-free for up to 4 months. Perfect for unmanageable hair.',
    price: 1800,
    duration_minutes: 90,
    category: 'Hair & Styling',
    image_url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-2',
    name: 'Balayage & Hair Colouring',
    description: 'Hand-painted highlights customised for your skin tone and hair length. Natural looking colour that grows out beautifully.',
    price: 2200,
    duration_minutes: 120,
    category: 'Hair & Styling',
    image_url: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-3',
    name: '24K Gold Glow Facial',
    description: 'Luxury facial with real 24K gold foil, hyaluronic serum and LED therapy. Gives instant glow and tightens skin.',
    price: 1500,
    duration_minutes: 75,
    category: 'Facial & Skincare',
    image_url: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-4',
    name: 'Deep Clean Hydra Facial',
    description: 'Multi-step deep cleansing facial with suction, salicylic exfoliation and antioxidant hydration. Leaves skin clear and glowing.',
    price: 1250,
    duration_minutes: 60,
    category: 'Facial & Skincare',
    image_url: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-5',
    name: 'Gel Manicure & Pedicure Combo',
    description: 'Complete nail shaping, cuticle care, sugar scrub massage and long-lasting gel polish for both hands and feet.',
    price: 950,
    duration_minutes: 60,
    category: 'Nails & Hands',
    image_url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-6',
    name: 'Bridal Makeup & Hair Styling',
    description: 'Complete bridal package with HD makeup, mink lashes, hair styling and jewellery fitting. Get ready for your big day with us.',
    price: 3500,
    duration_minutes: 150,
    category: 'Makeup & Bridal',
    image_url: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=800',
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'srv-7',
    name: 'Aromatherapy Body Massage',
    description: 'Deep tissue massage with essential oils to release body tension, improve blood flow and calm your mind. Full body relaxation.',
    price: 1400,
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
    bio: 'Founder & Senior Hair Stylist with 14+ years experience. Expert in Balayage, Keratin treatments and bridal hairstyles.',
    specialties: ['Balayage & Hair Colour', 'Keratin Treatment', 'Bridal Hair'],
    photo_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    role: 'admin',
    email: 'monika@monikazparlour.com',
    phone: '+91 98765 00000',
    permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews', 'manage_permissions'],
    rating: 4.9,
    reviews_count: 48
  },
  {
    id: 'stf-2',
    full_name: 'Aisha Patel',
    bio: 'Senior Skin Specialist & Parlour Manager. Expert in 24K Gold facials, anti-aging treatments and sensitive skin care.',
    specialties: ['24K Gold Facial', 'Hydra Facial', 'Chemical Peel'],
    photo_url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    role: 'manager',
    email: 'aisha.p@monikazparlour.com',
    phone: '+91 98765 11111',
    permissions: ['view_analytics', 'manage_bookings', 'manage_services', 'manage_staff', 'manage_reviews'],
    rating: 4.95,
    reviews_count: 39
  },
  {
    id: 'stf-3',
    full_name: 'Neha Kapoor',
    bio: 'Master Nail Artist. Specialises in gel extensions, nail art, Russian manicure and hand spa treatments.',
    specialties: ['Gel Manicure', 'Nail Art', 'Russian Manicure'],
    photo_url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    role: 'staff',
    email: 'neha.k@monikazparlour.com',
    phone: '+91 98765 22222',
    permissions: ['manage_bookings', 'manage_reviews'],
    rating: 4.88,
    reviews_count: 27
  },
  {
    id: 'stf-4',
    full_name: 'Ananya Verma',
    bio: 'Celebrity Makeup Artist. Expert in HD airbrush, bridal makeup, natural glow looks and evening party glam.',
    specialties: ['Bridal Makeup', 'Airbrush Makeup', 'Evening Glam'],
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    role: 'staff',
    email: 'ananya.v@monikazparlour.com',
    phone: '+91 98765 33333',
    permissions: ['manage_bookings'],
    rating: 5.0,
    reviews_count: 32
  },
  {
    id: 'stf-5',
    full_name: 'Priya Nair',
    bio: 'Certified Spa & Body Therapist. Specialises in deep tissue massage, aromatherapy, Ayurvedic treatments and body scrubs.',
    specialties: ['Deep Tissue Massage', 'Aromatherapy', 'Body Scrub'],
    photo_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
    is_active: true,
    role: 'staff',
    email: 'priya.n@monikazparlour.com',
    phone: '+91 98765 44444',
    permissions: ['manage_bookings'],
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
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98765 43210',
    customer_email: 'priya.sharma@email.com',
    service_id: 'srv-3',
    service_name: '24K Gold Glow Facial',
    service_price: 1500,
    service_duration: 75,
    staff_id: 'stf-2',
    staff_name: 'Aisha Patel',
    booking_date: getTodayString(0),
    start_time: '11:00',
    end_time: '12:15',
    status: 'in_progress',
    notes: 'Please use gentle moisturiser, I have sensitive skin.',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: 'bk-102',
    customer_id: 'user-c1',
    customer_name: 'Priya Sharma',
    customer_phone: '+91 98765 43210',
    customer_email: 'priya.sharma@email.com',
    service_id: 'srv-1',
    service_name: 'Keratin & Gloss Hair Treatment',
    service_price: 1800,
    service_duration: 90,
    staff_id: 'stf-1',
    staff_name: 'Monika Sharma',
    booking_date: getTodayString(1),
    start_time: '14:00',
    end_time: '15:30',
    status: 'confirmed',
    notes: 'Getting ready for my sister wedding!',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'bk-103',
    customer_id: 'user-c2',
    customer_name: 'Ananya Verma',
    customer_phone: '+91 98765 87654',
    customer_email: 'ananya.v@email.com',
    service_id: 'srv-5',
    service_name: 'Gel Manicure & Pedicure Combo',
    service_price: 950,
    service_duration: 60,
    staff_id: 'stf-3',
    staff_name: 'Neha Kapoor',
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
    customer_name: 'Meera Iyer',
    customer_phone: '+91 98765 34567',
    customer_email: 'meera.i@email.com',
    service_id: 'srv-6',
    service_name: 'Bridal Makeup & Hair Styling',
    service_price: 3500,
    service_duration: 150,
    staff_id: 'stf-4',
    staff_name: 'Ananya Verma',
    booking_date: getTodayString(3),
    start_time: '10:00',
    end_time: '12:30',
    status: 'pending',
    notes: 'Bridal trial for December wedding.',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    booking_id: 'bk-103',
    customer_id: 'user-c2',
    customer_name: 'Ananya Verma',
    service_id: 'srv-5',
    service_name: 'Gel Manicure & Pedicure Combo',
    staff_id: 'stf-3',
    staff_name: 'Neha Kapoor',
    rating: 5,
    comment: 'Neha is amazing! My manicure lasted 3 weeks without any chip. The hand massage was so relaxing.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    admin_response: 'Thank you Ananya! Looking forward to seeing you again!'
  },
  {
    id: 'rev-2',
    booking_id: 'bk-099',
    customer_id: 'user-c4',
    customer_name: 'Kavita Reddy',
    service_id: 'srv-1',
    service_name: 'Keratin & Gloss Hair Treatment',
    staff_id: 'stf-1',
    staff_name: 'Monika Sharma',
    rating: 5,
    comment: 'Monika transformed my dry frizzy hair into silky smooth! The salon is so clean and welcoming.',
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

export const INITIAL_SHOP: Shop = {
  id: 'shop-1',
  name: 'Monikaz Parlour',
  logo_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=200'
};

export const INITIAL_ADDRESSES: Address[] = [
  { id: 'addr-1', shop_id: 'shop-1', address: '123, Linking Road, Bandra West, Mumbai - 400050' }
];

export const INITIAL_SOCIAL_MEDIA: SocialMedia[] = [
  { id: 'sm-1', shop_id: 'shop-1', media_name: 'instagram', link: 'https://instagram.com/monikazparlour' },
  { id: 'sm-2', shop_id: 'shop-1', media_name: 'facebook', link: 'https://facebook.com/monikazparlour' }
];
