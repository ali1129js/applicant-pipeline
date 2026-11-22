import { describe, expect, it } from "vitest";
import { applicantSchema, type Applicant } from "../domain/schemas";
import { runGraphql } from "./execute";

const NOW = new Date("2026-11-22T12:00:00.000Z");

function applicant(over: Partial<Applicant> & Pick<Applicant, "id" | "stage" | "history">): Applicant {
  const entered =
    over.stageEnteredAt ?? over.history[over.history.length - 1]?.enteredAt ?? "2026-11-01T08:00:00.000Z";
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

function ctx(rows: Applicant[]) {
  return { applicants: rows, now: NOW };
}

describe("in-browser GraphQL layer", () => {
  it("queries applicants, a single applicant and pipeline stats", () => {
    const rows = [
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
    ];
    const result = runGraphql<{
      applicants: { id: string }[];
      applicant: { name: string; stage: string } | null;
      stats: { total: number; conversions: { stage: string; reached: number; conversionPct: number | null }[] };
    }>(
      `query ($id: ID!) {
        applicants { id }
        applicant(id: $id) { name stage }
        stats { total conversions { stage reached conversionPct } }
      }`,
      ctx(rows),
      { id: "b" },
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.applicants.map((row) => row.id)).toEqual(["a", "b"]);
    expect(result.data?.applicant).toEqual({ name: "b", stage: "screening" });
    expect(result.data?.stats.total).toBe(2);
    expect(result.data?.stats.conversions[0]).toEqual({
      stage: "applied",
      reached: 2,
      conversionPct: null,
    });
    expect(result.data?.stats.conversions[1]?.conversionPct).toBe(50);
  });

  it("moves an applicant through a mutation and leaves the original list unshifted until context is updated", () => {
    const rows = [
      applicant({
        id: "a",
        stage: "applied",
        history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
      }),
    ];
    const original = rows;
    const result = runGraphql<{ moveApplicant: { ok: boolean; error: string | null; applicant: { stage: string } } }>(
      `mutation { moveApplicant(id: "a", to: screening) { ok error applicant { stage } } }`,
      ctx(rows),
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.moveApplicant).toEqual({
      ok: true,
      error: null,
      applicant: { stage: "screening" },
    });
    expect(result.applicants[0]?.stage).toBe("screening");
    expect(original[0]?.stage).toBe("applied");
  });

  it("returns rejected-needs-reason and hired-is-terminal without changing the board", () => {
    const rows = [
      applicant({
        id: "a",
        stage: "applied",
        history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
      }),
      applicant({
        id: "h",
        stage: "hired",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-02T08:00:00.000Z" },
          { stage: "hired", enteredAt: "2026-11-02T08:00:00.000Z" },
        ],
      }),
    ];
    const reject = runGraphql<{ moveApplicant: { ok: boolean; error: string | null } }>(
      `mutation { moveApplicant(id: "a", to: rejected) { ok error } }`,
      ctx(rows),
    );
    expect(reject.data?.moveApplicant).toEqual({ ok: false, error: "rejected-needs-reason" });
    expect(reject.applicants[0]?.stage).toBe("applied");

    const withReason = runGraphql<{ moveApplicant: { ok: boolean; applicant: { rejectionReason: string } } }>(
      `mutation { moveApplicant(id: "a", to: rejected, reason: "Skills gap") { ok applicant { rejectionReason } } }`,
      ctx(rows),
    );
    expect(withReason.data?.moveApplicant.ok).toBe(true);
    expect(withReason.data?.moveApplicant.applicant.rejectionReason).toBe("Skills gap");

    const hired = runGraphql<{ moveApplicant: { ok: boolean; error: string | null } }>(
      `mutation { moveApplicant(id: "h", to: interview) { ok error } }`,
      ctx(rows),
    );
    expect(hired.data?.moveApplicant).toEqual({ ok: false, error: "hired-is-terminal" });
    expect(hired.applicants.find((row) => row.id === "h")?.stage).toBe("hired");
  });

  it("adds a note, updates a rating and resets the board", () => {
    const rows = [
      applicant({
        id: "a",
        stage: "applied",
        history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
      }),
    ];
    const noted = runGraphql<{ addNote: { notes: { body: string }[] } }>(
      `mutation { addNote(id: "a", body: "Strong portfolio") { notes { body } } }`,
      ctx(rows),
    );
    expect(noted.data?.addNote.notes).toEqual([{ body: "Strong portfolio" }]);
    const noteId = noted.applicants[0]?.notes[0]?.id;
    expect(noteId).toBeTruthy();

    const rated = runGraphql<{ setRating: { rating: number } }>(
      `mutation { setRating(id: "a", rating: 5) { rating } }`,
      ctx(noted.applicants),
    );
    expect(rated.data?.setRating.rating).toBe(5);

    const cleared = runGraphql<{ removeNote: { notes: { id: string }[] } }>(
      `mutation ($id: ID!) { removeNote(id: "a", noteId: $id) { notes { id } } }`,
      ctx(rated.applicants),
      { id: noteId },
    );
    expect(cleared.data?.removeNote.notes).toEqual([]);

    const reset = runGraphql<{ resetBoard: { id: string }[] }>(`mutation { resetBoard { id } }`, ctx(cleared.applicants));
    expect(reset.errors).toBeUndefined();
    expect(reset.applicants.length).toBeGreaterThan(1);
    expect(reset.applicants.map((row) => row.id)).not.toEqual(cleared.applicants.map((row) => row.id));
  });
});
