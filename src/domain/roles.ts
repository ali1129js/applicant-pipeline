import type { Role, RoleId } from "./schemas";

export const ROLES: readonly Role[] = [
  { id: "frontend-engineer", titleEn: "Frontend Engineer", titleDe: "Frontend-Ingenieur" },
  { id: "backend-engineer", titleEn: "Backend Engineer", titleDe: "Backend-Ingenieur" },
  { id: "product-designer", titleEn: "Product Designer", titleDe: "Produktdesigner" },
  { id: "customer-success", titleEn: "Customer Success", titleDe: "Customer Success" },
];

const byId = new Map(ROLES.map((role) => [role.id, role]));

export function roleById(id: RoleId): Role {
  const role = byId.get(id);
  if (!role) throw new Error(`Unknown role ${id}`);
  return role;
}
