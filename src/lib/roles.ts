export type StaffRole = "ADMIN" | "SUPER_ADMIN";

export function isStaff(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdmin(role?: string | null) {
  return role === "SUPER_ADMIN";
}

export function canManageUsers(role?: string | null) {
  return role === "SUPER_ADMIN";
}

export function canManageCatalog(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}
