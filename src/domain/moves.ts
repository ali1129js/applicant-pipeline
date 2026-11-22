import type { Applicant, Note, Stage } from "./schemas";

export type MoveError = "already-there" | "rejected-needs-reason" | "hired-is-terminal";

export type MoveResult = { ok: true; applicant: Applicant } | { ok: false; error: MoveError };

export interface MoveOptions {
  to: Stage;
  at: Date;
  reason?: string;
}

export function daysInStage(applicant: Applicant, at: Date = new Date()): number {
  const entered = Date.parse(applicant.stageEnteredAt);
  if (Number.isNaN(entered)) return 0;
  const ms = Math.max(0, at.getTime() - entered);
  return Math.floor(ms / 86_400_000);
}

export function applicantsInStage(applicants: readonly Applicant[], stage: Stage): Applicant[] {
  return applicants.filter((applicant) => applicant.stage === stage);
}

function iso(at: Date): string {
  return at.toISOString();
}

function withoutRejectionReason(applicant: Applicant): Applicant {
  if (!("rejectionReason" in applicant)) return applicant;
  const rest = { ...applicant };
  delete rest.rejectionReason;
  return rest;
}

/**
 * Pure stage transition. Rejected requires a reason. Hired is terminal.
 * History is closed and a new event is appended. The original applicant is not mutated.
 */
export function moveApplicant(applicant: Applicant, options: MoveOptions): MoveResult {
  const { to, at } = options;
  if (applicant.stage === to) return { ok: false, error: "already-there" };
  if (applicant.stage === "hired") return { ok: false, error: "hired-is-terminal" };
  const reason = options.reason?.trim() ?? "";
  if (to === "rejected" && reason.length === 0) {
    return { ok: false, error: "rejected-needs-reason" };
  }

  const atIso = iso(at);
  const lastIndex = applicant.history.length - 1;
  const history = applicant.history.map((event, index) =>
    index === lastIndex && event.exitedAt === undefined ? { ...event, exitedAt: atIso } : event,
  );
  history.push({
    stage: to,
    enteredAt: atIso,
    ...(to === "rejected" ? { reason } : {}),
  });

  const base = withoutRejectionReason({
    ...applicant,
    stage: to,
    stageEnteredAt: atIso,
    history,
  });

  const next: Applicant = to === "rejected" ? { ...base, rejectionReason: reason } : base;

  return { ok: true, applicant: next };
}

export function addNote(applicant: Applicant, body: string, at: Date): Applicant | null {
  const trimmed = body.trim();
  if (trimmed.length === 0) return null;
  const note: Note = {
    id: `note-${applicant.notes.length + 1}-${at.getTime()}`,
    body: trimmed,
    createdAt: iso(at),
  };
  return { ...applicant, notes: [...applicant.notes, note] };
}

export function removeNote(applicant: Applicant, noteId: string): Applicant {
  return { ...applicant, notes: applicant.notes.filter((note) => note.id !== noteId) };
}

export function setRating(applicant: Applicant, rating: 1 | 2 | 3 | 4 | 5): Applicant {
  return { ...applicant, rating };
}
