import { PermissionKey, Profile, UserRole } from '../types';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  description: string;
  category: 'Operations' | 'Management' | 'Security';
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  {
    key: 'view_analytics',
    label: 'View Analytics & Revenue',
    description: 'Access financial charts, revenue reports, and parlour performance metrics.',
    category: 'Operations',
  },
  {
    key: 'manage_bookings',
    label: 'Manage Bookings',
    description: 'Confirm, reschedule, update status, and manage client appointments.',
    category: 'Operations',
  },
  {
    key: 'manage_services',
    label: 'Manage Services & Pricing',
    description: 'Add, update pricing, edit details, or activate/deactivate parlour services.',
    category: 'Management',
  },
  {
    key: 'manage_staff',
    label: 'Manage Staff Roster',
    description: 'Create new staff profiles, upload avatars, edit specialties, and manage active status.',
    category: 'Management',
  },
  {
    key: 'manage_reviews',
    label: 'Manage & Respond to Reviews',
    description: 'Read customer reviews and respond with official owner/staff feedback.',
    category: 'Operations',
  },
  {
    key: 'manage_permissions',
    label: 'Security & Permission Control',
    description: 'Assign staff roles (Manager, Staff) and configure granular action permissions.',
    category: 'Security',
  },
];

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  admin: [
    'view_analytics',
    'manage_bookings',
    'manage_services',
    'manage_staff',
    'manage_reviews',
    'manage_permissions',
  ],
  manager: [
    'view_analytics',
    'manage_bookings',
    'manage_services',
    'manage_staff',
    'manage_reviews',
  ],
  staff: [
    'manage_bookings',
    'manage_reviews',
  ],
  customer: [],
};

/**
  Check if a user profile has a specific permission key.
  Admins always have all permissions.
  Other roles check custom permissions or fallback to default role permissions.
 */
export function hasPermission(
  user: Profile | null | undefined,
  permission: PermissionKey
): boolean {
  if (!user) return false;
  
  // Admin / Owner override - full access always
  if (user.role === 'admin') return true;

  // Check explicit user permissions first
  if (user.permissions && Array.isArray(user.permissions)) {
    if (user.permissions.includes(permission)) return true;
  }

  // Fallback to role defaults
  const roleDefaults = DEFAULT_ROLE_PERMISSIONS[user.role] || [];
  return roleDefaults.includes(permission);
}

/**
 * Returns effective permission list for a role and optional custom array
 */
export function getEffectivePermissions(
  role: UserRole,
  customPermissions?: PermissionKey[]
): PermissionKey[] {
  if (role === 'admin') {
    return DEFAULT_ROLE_PERMISSIONS.admin;
  }
  if (customPermissions && Array.isArray(customPermissions) && customPermissions.length > 0) {
    return customPermissions;
  }
  return DEFAULT_ROLE_PERMISSIONS[role] || [];
}
