/** Every role in Petrock. Order matters for display. */
export const ROLES = ['super_admin', 'owner', 'manager', 'front_desk', 'groomer', 'customer', 'public'] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABEL: Record<Role, string> = {
  super_admin: 'Super admin', owner: 'Owner', manager: 'Manager', front_desk: 'Front desk', groomer: 'Groomer', customer: 'Customer', public: 'Public',
};

export const STAFF_ROLES: Role[] = ['super_admin', 'owner', 'manager', 'front_desk', 'groomer'];
/** Roles whose PIN can approve a manager-gated action. */
export const APPROVER_ROLES: Role[] = ['super_admin', 'owner', 'manager'];
/** Roles that see every location and can switch. */
export const ALL_LOCATION_ROLES: Role[] = ['super_admin', 'owner'];
export const ALL_SIGNED_IN: Role[] = ['super_admin', 'owner', 'manager', 'front_desk', 'groomer', 'customer'];
export const EVERYONE: Role[] = [...ALL_SIGNED_IN, 'public'];

/** Which home a role lands on after choosing it. */
export const ROLE_HOME: Record<Role, string> = {
  super_admin: '/admin', owner: '/admin', manager: '/desk', front_desk: '/desk', groomer: '/desk/grooming', customer: '/app', public: '/site',
};
