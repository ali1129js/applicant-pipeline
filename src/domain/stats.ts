import { ROLE_IDS, STAGES, type Applicant, type RoleId, type Stage } from "./schemas";

/** Hiring funnel, in order. Rejected is a side exit, not a funnel step. */
export const FUNNEL_STAGES = ["applied", "screening", "interview", "offer", "hired"] as const;
export type FunnelStage = (typeof FUNNEL_STAGES)[number];

export interface StageConversion {
  stage: FunnelStage;
  reached: number;
  /** Percent of the previous funnel stage. Null for Applied (the top of the funnel). */
  conversionPct: number | null;
}

export interface StageMedian {
  stage: Stage;
  medianDays: number | null;
  samples: number;
}

export interface RoleCount {
  roleId: RoleId;
  count: number;
}

export interface PipelineStats {
  conversions: StageConversion[];
  medians: StageMedian[];
  roles: RoleCount[];
  total: number;
}

export function everReached(applicant: Applicant, stage: Stage): boolean {
  return applicant.history.some((event) => event.stage === stage) || applicant.stage === stage;
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = Date.parse(fromIso);
  const to = Date.parse(toIso);
  if (Number.isNaN(from) || Number.isNaN(to) || to < from) return 0;
  return Math.floor((to - from) / 86_400_000);
}

/** Median of a non-empty list of integers. For an even count, the lower middle value is used. */
export function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor((sorted.length - 1) / 2);
  return sorted[mid] ?? null;
}

export function conversionByStage(applicants: readonly Applicant[]): StageConversion[] {
  const reached = FUNNEL_STAGES.map((stage) => applicants.filter((row) => everReached(row, stage)).length);
  return FUNNEL_STAGES.map((stage, index) => {
    const count = reached[index] ?? 0;
    const previous = index === 0 ? null : (reached[index - 1] ?? 0);
    const conversionPct =
      previous === null ? null : previous === 0 ? 0 : Math.round((100 * count) / previous);
    return { stage, reached: count, conversionPct };
  });
}

/**
 * Days spent in a stage: completed visits from history, plus the current
 * tenure of anyone still in that stage.
 */
export function daysInStageSamples(applicants: readonly Applicant[], stage: Stage, now: Date): number[] {
  const nowIso = now.toISOString();
  const samples: number[] = [];
  for (const applicant of applicants) {
    for (const event of applicant.history) {
      if (event.stage !== stage) continue;
      const end = event.exitedAt ?? (applicant.stage === stage ? nowIso : undefined);
      if (!end) continue;
      samples.push(daysBetween(event.enteredAt, end));
    }
  }
  return samples;
}

export function medianDaysByStage(applicants: readonly Applicant[], now: Date): StageMedian[] {
  return STAGES.map((stage) => {
    const samples = daysInStageSamples(applicants, stage, now);
    return { stage, medianDays: median(samples), samples: samples.length };
  });
}

export function countByRole(applicants: readonly Applicant[]): RoleCount[] {
  return ROLE_IDS.map((roleId) => ({
    roleId,
    count: applicants.filter((row) => row.roleId === roleId).length,
  }));
}

export function pipelineStats(applicants: readonly Applicant[], now: Date): PipelineStats {
  return {
    conversions: conversionByStage(applicants),
    medians: medianDaysByStage(applicants, now),
    roles: countByRole(applicants),
    total: applicants.length,
  };
}
