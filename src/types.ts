/**
 * Monikaz Parlour - Data Models & Types
 */

export type UserRole = 'customer' | 'staff' | 'manager' | 'admin';

export type PermissionKey =
  | 'view_analytics'
  | 'manage_bookings'
  | 'manage_services'
  | 'manage_staff'
  | 'manage_reviews'
  | 'manage_permissions';

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  role: UserRole;
  permissions?: PermissionKey[];
  avatar_url?: string;
  created_at: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  category: 'Hair & Styling' | 'Facial & Skincare' | 'Nails & Hands' | 'Makeup & Bridal' | 'Body Spa';
  image_url: string;
  is_active: boolean;
  created_at?: string;
}

export interface Staff {
  id: string;
  full_name: string;
  bio: string;
  specialties: string[];
  photo_url: string;
  is_active: boolean;
  role?: UserRole;
  email?: string;
  phone?: string;
  permissions?: PermissionKey[];
  rating?: number;
  reviews_count?: number;
  created_at?: string;
}

export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';

export interface Booking {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  service_id: string;
  service_name: string;
  service_price: number;
  service_duration: number;
  staff_id?: string;
  staff_name?: string;
  booking_date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  status: BookingStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  customer_id: string;
  customer_name: string;
  service_id?: string;
  service_name?: string;
  staff_id?: string;
  staff_name?: string;
  rating: number; // 1 to 5
  comment: string;
  created_at: string;
  admin_response?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking_status' | 'reminder' | 'system';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}
