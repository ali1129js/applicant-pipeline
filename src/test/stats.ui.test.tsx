import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatsStrip } from "../components/StatsStrip";
import { applicantSchema, type Applicant } from "../domain/schemas";
import { STRINGS } from "../lib/i18n";

const NOW = new Date("2026-11-22T12:00:00.000Z");
const strings = STRINGS.en;

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

describe("StatsStrip", () => {
  it("shows conversion, median days and role counts from the given applicants", () => {
    const rows: Applicant[] = [
      applicant({
        id: "a",
        stage: "applied",
        history: [{ stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z" }],
      }),
      applicant({
        id: "b",
        stage: "screening",
        roleId: "backend-engineer",
        history: [
          { stage: "applied", enteredAt: "2026-11-01T08:00:00.000Z", exitedAt: "2026-11-05T08:00:00.000Z" },
          { stage: "screening", enteredAt: "2026-11-05T08:00:00.000Z" },
        ],
      }),
    ];
    render(<StatsStrip applicants={rows} now={NOW} strings={strings} />);
    const region = screen.getByRole("region", { name: strings.statsHeading });
    expect(within(region).getByText(strings.statsTotal(2))).toBeInTheDocument();
    expect(within(region).getByText("2 reached")).toBeInTheDocument();
    expect(within(region).getByText(strings.statsConversionOf(50))).toBeInTheDocument();
    expect(within(region).getByText("Frontend Engineer")).toBeInTheDocument();
    expect(within(region).getAllByText("1")).toHaveLength(2);
  });
});
