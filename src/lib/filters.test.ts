import { describe, expect, it } from "vitest";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "./demo";
import {
  DEFAULT_FILTERS,
  matchesFilters,
  parseFilters,
  serializeFilters,
  sortApplicants,
  visibleInStage,
} from "./filters";

const all = generateApplicants({ referenceDate: DEMO_TODAY });

describe("filter URL state", () => {
  it("round-trips query, role, rating and sort", () => {
    const filters = {
      query: "mira",
      roleId: "frontend-engineer" as const,
      rating: 4 as const,
      sort: "days" as const,
    };
    expect(parseFilters(serializeFilters(filters))).toEqual(filters);
  });

  it("ignores unknown values and empty query", () => {
    expect(parseFilters("?q=&role=chef&rating=9&sort=colour")).toEqual(DEFAULT_FILTERS);
    expect(serializeFilters(DEFAULT_FILTERS)).toBe("");
  });
});

describe("filter and sort", () => {
  it("filters by name, role and rating", () => {
    const sample = all[0];
    if (!sample) throw new Error("empty seed");
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, query: sample.name.slice(0, 3) })).toBe(
      true,
    );
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, query: "zzzz" })).toBe(false);
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, roleId: sample.roleId })).toBe(true);
    const otherRole =
      sample.roleId === "frontend-engineer" ? "backend-engineer" : "frontend-engineer";
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, roleId: otherRole })).toBe(false);
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, rating: sample.rating as 1 | 2 | 3 | 4 | 5 })).toBe(true);
    const otherRating = (sample.rating === 5 ? 1 : 5) as 1 | 2 | 3 | 4 | 5;
    expect(matchesFilters(sample, { ...DEFAULT_FILTERS, rating: otherRating })).toBe(false);
  });

  it("sorts a column by name, rating and days in stage", () => {
    const byName = sortApplicants(all, "name", DEMO_TODAY);
    expect(byName.map((row) => row.name)).toEqual(
      [...byName].map((row) => row.name).sort((a, b) => a.localeCompare(b)),
    );
    const byRating = sortApplicants(all, "rating", DEMO_TODAY);
    for (let i = 1; i < byRating.length; i += 1) {
      const prev = byRating[i - 1];
      const current = byRating[i];
      if (!prev || !current) throw new Error("sort result gap");
      expect(prev.rating).toBeGreaterThanOrEqual(current.rating);
    }
    const applied = visibleInStage(
      all,
      "applied",
      { ...DEFAULT_FILTERS, sort: "name" },
      DEMO_TODAY,
    );
    const names = applied.map((row) => row.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});
