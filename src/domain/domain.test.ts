import { describe, expect, it } from "vitest";
import {
  addNote,
  moveApplicant,
  removeNote,
  setRating,
  daysInStage,
  applicantsInStage,
} from "./moves";
import { generateApplicants, APPLICANT_COUNT, SEED } from "./seed";
import { ROLES } from "./roles";
import { applicantSchema, STAGES, type Applicant, type Stage } from "./schemas";

const AT = new Date("2026-11-22T12:00:00.000Z");

function sample(over: Partial<Applicant> = {}): Applicant {
  const base: Applicant = {
    id: "app-01",
    name: "Mira Adler",
    email: "mira.adler@example.com",
    roleId: "frontend-engineer",
    stage: "applied",
    rating: 3,
    appliedAt: "2026-11-01T08:00:00.000Z",
    stageEnteredAt: "2026-11-01T08:00:00.000Z",
    notes: [],
    history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
  };
  return applicantSchema.parse({ ...base, ...over });
}

describe("moveApplicant", () => {
  it("moves Applied to Screening and records history without mutating the original", () => {
    const from = sample();
    const result = moveApplicant(from, { to: "screening", at: AT });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applicant.stage).toBe("screening");
    expect(result.applicant.stageEnteredAt).toBe(AT.toISOString());
    expect(result.applicant.history).toEqual([
      { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: AT.toISOString() },
      { stage: "screening", enteredAt: AT.toISOString() },
    ]);
    expect(from.stage).toBe("applied");
    expect(from.history).toHaveLength(1);
  });

  it("refuses a no-op move", () => {
    expect(moveApplicant(sample(), { to: "applied", at: AT })).toEqual({
      ok: false,
      error: "already-there",
    });
  });

  it("requires a reason when moving to Rejected, including a whitespace-only reason", () => {
    const from = sample({ stage: "interview", stageEnteredAt: "2026-11-10T09:00:00.000Z" });
    expect(moveApplicant(from, { to: "rejected", at: AT })).toEqual({
      ok: false,
      error: "rejected-needs-reason",
    });
    expect(moveApplicant(from, { to: "rejected", at: AT, reason: "   " })).toEqual({
      ok: false,
      error: "rejected-needs-reason",
    });
    const result = moveApplicant(from, {
      to: "rejected",
      at: AT,
      reason: "  Timing did not work.  ",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applicant.stage).toBe("rejected");
    expect(result.applicant.rejectionReason).toBe("Timing did not work.");
    expect(result.applicant.history.at(-1)?.reason).toBe("Timing did not work.");
  });

  it("treats Hired as terminal", () => {
    const hired = sample({
      stage: "hired",
      stageEnteredAt: "2026-11-18T09:00:00.000Z",
      history: [
        {
          stage: "applied",
          enteredAt: "2026-11-01T08:00:00.000Z",
          exitedAt: "2026-11-18T09:00:00.000Z",
        },
        { stage: "hired", enteredAt: "2026-11-18T09:00:00.000Z" },
      ],
    });
    expect(moveApplicant(hired, { to: "applied", at: AT })).toEqual({
      ok: false,
      error: "hired-is-terminal",
    });
    expect(moveApplicant(hired, { to: "rejected", at: AT, reason: "Changed mind" })).toEqual({
      ok: false,
      error: "hired-is-terminal",
    });
  });

  it("can reopen a rejected applicant and drops the stored reason", () => {
    const rejected = sample({
      stage: "rejected",
      rejectionReason: "Role does not match current experience.",
      stageEnteredAt: "2026-11-12T09:00:00.000Z",
      history: [
        {
          stage: "applied",
          enteredAt: "2026-11-01T08:00:00.000Z",
          exitedAt: "2026-11-12T09:00:00.000Z",
        },
        {
          stage: "rejected",
          enteredAt: "2026-11-12T09:00:00.000Z",
          reason: "Role does not match current experience.",
        },
      ],
    });
    const result = moveApplicant(rejected, { to: "screening", at: AT });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.applicant.stage).toBe("screening");
    expect(result.applicant.rejectionReason).toBeUndefined();
    expect("rejectionReason" in result.applicant).toBe(false);
  });

  it.each(["screening", "interview", "offer", "hired"] as const)(
    "allows a forward move to %s from applied",
    (to: Stage) => {
      const result = moveApplicant(sample(), { to, at: AT });
      expect(result.ok).toBe(true);
    },
  );
});

describe("notes, rating and daysInStage", () => {
  it("adds a trimmed note and rejects a blank one", () => {
    const from = sample();
    expect(addNote(from, "   ", AT)).toBeNull();
    const next = addNote(from, "  Strong homework.  ", AT);
    expect(next?.notes).toEqual([
      { id: `note-1-${AT.getTime()}`, body: "Strong homework.", createdAt: AT.toISOString() },
    ]);
    expect(from.notes).toHaveLength(0);
  });

  it("removes a note by id and updates a rating", () => {
    const withNote = addNote(sample(), "Keep in touch.", AT);
    expect(withNote).not.toBeNull();
    if (!withNote) return;
    const noteId = withNote.notes[0]?.id;
    expect(noteId).toBeDefined();
    expect(removeNote(withNote, noteId as string).notes).toEqual([]);
    expect(setRating(withNote, 5).rating).toBe(5);
  });

  it("counts whole days in the current stage", () => {
    const applicant = sample({ stageEnteredAt: "2026-11-20T12:00:00.000Z" });
    expect(daysInStage(applicant, AT)).toBe(2);
    expect(daysInStage(applicant, new Date("2026-11-20T15:00:00.000Z"))).toBe(0);
  });
});

describe("generateApplicants", () => {
  it("produces a stable, schema-valid set of about 40 fictional applicants across all four roles", () => {
    const first = generateApplicants({ referenceDate: AT });
    const second = generateApplicants({ seed: SEED, referenceDate: AT });
    expect(first).toHaveLength(APPLICANT_COUNT);
    expect(first).toEqual(second);
    expect(first.every((row) => applicantSchema.safeParse(row).success)).toBe(true);
    const roleIds = new Set(first.map((row) => row.roleId));
    expect([...roleIds].sort()).toEqual(ROLES.map((role) => role.id).sort());
    const stages = new Set(first.map((row) => row.stage));
    expect(STAGES.every((stage) => stages.has(stage))).toBe(true);
    expect(first.every((row) => row.email.endsWith("@example.com"))).toBe(true);
    expect(first.some((row) => row.stage === "rejected" && row.rejectionReason)).toBe(true);
  });

  it("groups applicants by stage without dropping anyone", () => {
    const all = generateApplicants({ referenceDate: AT });
    const grouped = STAGES.flatMap((stage) => applicantsInStage(all, stage));
    expect(grouped).toHaveLength(all.length);
  });

  it("rejects a hired-looking record that is missing a reason when the stage is rejected", () => {
    const parsed = applicantSchema.safeParse({
      ...sample(),
      stage: "rejected",
    });
    expect(parsed.success).toBe(false);
  });
});
