import { daysInStage } from "../domain/moves";
import { ROLE_IDS, type Applicant, type RoleId, type Stage } from "../domain/schemas";
import { applicantsInStage } from "../domain/moves";

export const SORTS = ["name", "rating", "days"] as const;
export type SortKey = (typeof SORTS)[number];

export interface BoardFilters {
  query: string;
  roleId: RoleId | "all";
  rating: 1 | 2 | 3 | 4 | 5 | "all";
  sort: SortKey;
}

export const DEFAULT_FILTERS: BoardFilters = {
  query: "",
  roleId: "all",
  rating: "all",
  sort: "name",
};

export function parseFilters(search: string): BoardFilters {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const query = params.get("q")?.trim() ?? "";
  const roleRaw = params.get("role");
  const roleId: BoardFilters["roleId"] =
    roleRaw && (ROLE_IDS as readonly string[]).includes(roleRaw) ? (roleRaw as RoleId) : "all";
  const ratingRaw = Number(params.get("rating"));
  const rating: BoardFilters["rating"] =
    ratingRaw === 1 || ratingRaw === 2 || ratingRaw === 3 || ratingRaw === 4 || ratingRaw === 5
      ? ratingRaw
      : "all";
  const sortRaw = params.get("sort");
  const sort: SortKey = (SORTS as readonly string[]).includes(sortRaw ?? "")
    ? (sortRaw as SortKey)
    : "name";
  return { query, roleId, rating, sort };
}

export function serializeFilters(filters: BoardFilters): string {
  const params = new URLSearchParams();
  const query = filters.query.trim();
  if (query) params.set("q", query);
  if (filters.roleId !== "all") params.set("role", filters.roleId);
  if (filters.rating !== "all") params.set("rating", String(filters.rating));
  if (filters.sort !== "name") params.set("sort", filters.sort);
  const text = params.toString();
  return text ? `?${text}` : "";
}

export function matchesFilters(applicant: Applicant, filters: BoardFilters): boolean {
  const query = filters.query.trim().toLowerCase();
  if (query && !applicant.name.toLowerCase().includes(query)) return false;
  if (filters.roleId !== "all" && applicant.roleId !== filters.roleId) return false;
  if (filters.rating !== "all" && applicant.rating !== filters.rating) return false;
  return true;
}

export function sortApplicants(
  applicants: readonly Applicant[],
  sort: SortKey,
  now: Date,
): Applicant[] {
  const copy = [...applicants];
  copy.sort((a, b) => {
    if (sort === "rating") return b.rating - a.rating || a.name.localeCompare(b.name);
    if (sort === "days") {
      return daysInStage(b, now) - daysInStage(a, now) || a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });
  return copy;
}

export function visibleInStage(
  applicants: readonly Applicant[],
  stage: Stage,
  filters: BoardFilters,
  now: Date,
): Applicant[] {
  return sortApplicants(
    applicantsInStage(applicants, stage).filter((row) => matchesFilters(row, filters)),
    filters.sort,
    now,
  );
}
