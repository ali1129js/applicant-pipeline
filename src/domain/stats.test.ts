import { describe, expect, it } from "vitest";
import { applicantSchema, type Applicant } from "./schemas";
import {
  conversionByStage,
  countByRole,
  median,
  medianDaysByStage,
  pipelineStats,
} from "./stats";

const NOW = new Date("2026-11-22T12:00:00.000Z");

function applicant(over: Partial<Applicant> & Pick<Applicant, "id" | "stage" | "history">): Applicant {
  const entered = over.stageEnteredAt ?? over.history[over.history.length - 1]?.enteredAt ?? "2026-11-01T08:00:00.000Z";
  return applicantSchema.parse({
    name: over.name ?? over.id,
    email: `${over.id}@example.com`,
    roleId: "frontend-engineer",
    rating: 3,
    appliedAt: "2026-11-01T08:00:00.000Z",
    stageEnteredAt: entered,
    notes: [],
    ...over,
  });
}

describe("median", () => {
  it("returns null for an empty list and the middle value otherwise", () => {
    expect(median([])).toBeNull();
    expect(median([4])).toBe(4);
    expect(median([1, 3, 9])).toBe(3);
    expect(median([1, 2, 8, 9])).toBe(2);
  });
});

describe("conversionByStage", () => {
  it("is empty-safe and treats Applied as the top of the funnel", () => {
    expect(conversionByStage([])).toEqual([
      { stage: "applied", reached: 0, conversionPct: null },
      { stage: "screening", reached: 0, conversionPct: 0 },
      { stage: "interview", reached: 0, conversionPct: 0 },
      { stage: "offer", reached: 0, conversionPct: 0 },
      { stage: "hired", reached: 0, conversionPct: 0 },
    ]);
  });

  it("counts anyone who reached a stage, including people who later moved on", () => {
    const rows: Applicant[] = [
      applicant({
        id: "a",
        stage: "applied",
        history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
      }),
      applicant({
        id: "b",
        stage: "screening",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-05T08:00:00.000Z" },
          { stage: "screening", enteredAt: "2026-11-05T08:00:00.000Z" },
        ],
      }),
      applicant({
        id: "c",
        stage: "hired",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-03T08:00:00.000Z" },
          { stage: "screening", enteredAt: "2026-11-03T08:00:00.000Z", exitedAt: "2026-11-08T08:00:00.000Z" },
          { stage: "interview", enteredAt: "2026-11-08T08:00:00.000Z", exitedAt: "2026-11-12T08:00:00.000Z" },
          { stage: "offer", enteredAt: "2026-11-12T08:00:00.000Z", exitedAt: "2026-11-16T08:00:00.000Z" },
          { stage: "hired", enteredAt: "2026-11-16T08:00:00.000Z" },
        ],
      }),
    ];
    expect(conversionByStage(rows)).toEqual([
      { stage: "applied", reached: 3, conversionPct: null },
      { stage: "screening", reached: 2, conversionPct: 67 },
      { stage: "interview", reached: 1, conversionPct: 50 },
      { stage: "offer", reached: 1, conversionPct: 100 },
      { stage: "hired", reached: 1, conversionPct: 100 },
    ]);
  });
});

describe("medianDaysByStage and countByRole", () => {
  it("uses completed visits and current tenure, and counts roles", () => {
    const rows: Applicant[] = [
      applicant({
        id: "a",
        stage: "screening",
        roleId: "frontend-engineer",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-05T08:00:00.000Z" },
          { stage: "screening", enteredAt: "2026-11-05T08:00:00.000Z" },
        ],
      }),
      applicant({
        id: "b",
        stage: "interview",
        roleId: "backend-engineer",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-11T08:00:00.000Z" },
          { stage: "screening", enteredAt: "2026-11-11T08:00:00.000Z", exitedAt: "2026-11-13T08:00:00.000Z" },
          { stage: "interview", enteredAt: "2026-11-13T08:00:00.000Z" },
        ],
      }),
    ];
    const medians = medianDaysByStage(rows, NOW);
    const applied = medians.find((row) => row.stage === "applied");
    const screening = medians.find((row) => row.stage === "screening");
    // applied: 4 days and 10 days -> median 4 (lower middle of even list)
    expect(applied).toEqual({ stage: "applied", medianDays: 4, samples: 2 });
    // screening: current tenure 17 days (5 Nov to 22 Nov) and completed 2 days -> median 2
    expect(screening).toEqual({ stage: "screening", medianDays: 2, samples: 2 });

    expect(countByRole(rows)).toEqual([
      { roleId: "frontend-engineer", count: 1 },
      { roleId: "backend-engineer", count: 1 },
      { roleId: "product-designer", count: 0 },
      { roleId: "customer-success", count: 0 },
    ]);

    const stats = pipelineStats(rows, NOW);
    expect(stats.total).toBe(2);
    expect(stats.conversions[0]?.reached).toBe(2);
  });
});

