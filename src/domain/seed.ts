import { ROLES } from "./roles";
import type { Applicant, RoleId, Stage, StageEvent } from "./schemas";
import { applicantSchema } from "./schemas";

/** Fixed seed so the demo data is the same on every visit. */
export const SEED = 2026 * 10_000 + 1_122;
export const APPLICANT_COUNT = 40;

const FIRST_NAMES = [
  "Mira",
  "Jonas",
  "Leila",
  "Oskar",
  "Nina",
  "Tariq",
  "Elena",
  "Piotr",
  "Sofia",
  "Malik",
  "Hanna",
  "Yara",
  "Felix",
  "Amira",
  "Lars",
  "Noor",
  "Greta",
  "Diego",
  "Ines",
  "Kai",
] as const;

const LAST_NAMES = [
  "Adler",
  "Beckett",
  "Quill",
  "Voss",
  "Harlow",
  "Nadir",
  "Pellegrino",
  "Stern",
  "Ibarra",
  "Keene",
  "Linden",
  "Ostrov",
  "Patel-Reed",
  "Ramos",
  "Solberg",
  "Trent",
  "Ullman",
  "Weiss",
  "Younger",
  "Zahir",
] as const;

const NOTE_BODIES = [
  "Portfolio looks strong; follow up after the homework.",
  "Friendly intro call. Interested in a hybrid week.",
  "Asked about team size and onboarding.",
  "Referral from a previous colleague at a course project.",
] as const;

const REJECTION_REASONS = [
  "Role does not match current experience.",
  "Accepted another offer.",
  "Timing did not work for either side.",
] as const;

/** Deterministic mulberry32. */
export function createRng(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 2 ** 32;
  };
}

function pick<T>(rng: () => number, items: readonly T[]): T {
  const item = items[Math.floor(rng() * items.length)];
  if (item === undefined) throw new Error("empty pick list");
  return item;
}

function daysAgo(reference: Date, days: number, hour: number): Date {
  const at = new Date(reference);
  at.setUTCDate(at.getUTCDate() - days);
  at.setUTCHours(hour, Math.floor((hour * 7) % 60), 0, 0);
  return at;
}

/**
 * Weighted so earlier stages are fuller, and every role appears.
 * Hired and rejected stay small, which keeps the board readable.
 */
const STAGE_WEIGHTS: readonly { stage: Stage; weight: number }[] = [
  { stage: "applied", weight: 10 },
  { stage: "screening", weight: 8 },
  { stage: "interview", weight: 7 },
  { stage: "offer", weight: 5 },
  { stage: "hired", weight: 4 },
  { stage: "rejected", weight: 6 },
];

function pickStage(rng: () => number): Stage {
  const total = STAGE_WEIGHTS.reduce((sum, row) => sum + row.weight, 0);
  let cursor = rng() * total;
  for (const row of STAGE_WEIGHTS) {
    cursor -= row.weight;
    if (cursor <= 0) return row.stage;
  }
  return "applied";
}

const PATH: Record<Stage, Stage[]> = {
  applied: ["applied"],
  screening: ["applied", "screening"],
  interview: ["applied", "screening", "interview"],
  offer: ["applied", "screening", "interview", "offer"],
  hired: ["applied", "screening", "interview", "offer", "hired"],
  rejected: ["applied", "screening", "rejected"],
};

export interface SeedOptions {
  seed?: number;
  count?: number;
  referenceDate?: Date;
}

export function generateApplicants(options: SeedOptions = {}): Applicant[] {
  const seed = options.seed ?? SEED;
  const count = options.count ?? APPLICANT_COUNT;
  const reference = options.referenceDate ?? new Date("2026-11-22T12:00:00.000Z");
  const rng = createRng(seed);
  const out: Applicant[] = [];

  for (let i = 0; i < count; i += 1) {
    const first = pick(rng, FIRST_NAMES);
    const last = pick(rng, LAST_NAMES);
    const name = `${first} ${last}`;
    const email = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}${i}@example.com`;
    const roleId = ROLES[i % ROLES.length]?.id as RoleId;
    const stage = pickStage(rng);
    const rating = (1 + Math.floor(rng() * 5)) as 1 | 2 | 3 | 4 | 5;
    const path = PATH[stage];
    const appliedDays = 8 + Math.floor(rng() * 36);
    const appliedAt = daysAgo(reference, appliedDays, 8 + (i % 8));
    const stepDays = Math.max(1, Math.floor(appliedDays / path.length));

    const history: StageEvent[] = [];
    for (let s = 0; s < path.length; s += 1) {
      const step = path[s];
      if (step === undefined) continue;
      const entered = daysAgo(reference, Math.max(0, appliedDays - s * stepDays), 9 + s);
      const isLast = s === path.length - 1;
      const exited = isLast
        ? undefined
        : daysAgo(reference, Math.max(0, appliedDays - (s + 1) * stepDays), 10 + s);
      const event: StageEvent = {
        stage: step,
        enteredAt: entered.toISOString(),
        ...(exited ? { exitedAt: exited.toISOString() } : {}),
        ...(step === "rejected" ? { reason: pick(rng, REJECTION_REASONS) } : {}),
      };
      history.push(event);
    }

    const current = history[history.length - 1];
    if (!current) throw new Error("history missing");

    const notes =
      rng() > 0.55
        ? [
            {
              id: `note-${i}-1`,
              body: pick(rng, NOTE_BODIES),
              createdAt: daysAgo(reference, Math.floor(rng() * 6), 14).toISOString(),
            },
          ]
        : [];

    const applicant: Applicant = {
      id: `app-${String(i + 1).padStart(2, "0")}`,
      name,
      email,
      roleId,
      stage,
      rating,
      appliedAt: appliedAt.toISOString(),
      stageEnteredAt: current.enteredAt,
      notes,
      history,
      ...(stage === "rejected"
        ? { rejectionReason: current.reason ?? pick(rng, REJECTION_REASONS) }
        : {}),
    };
    out.push(applicantSchema.parse(applicant));
  }

  return out;
}
