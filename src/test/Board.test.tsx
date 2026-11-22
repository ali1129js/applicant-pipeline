import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Board } from "../components/Board";
import { generateApplicants } from "../domain/seed";
import { STAGES, type Applicant } from "../domain/schemas";
import { daysInStage } from "../domain/moves";
import { DEMO_TODAY } from "../lib/demo";
import { DEFAULT_FILTERS } from "../lib/filters";
import { STRINGS } from "../lib/i18n";

const strings = STRINGS.en;
const all = generateApplicants({ referenceDate: DEMO_TODAY });

describe("Board", () => {
  it("renders a column per stage with a count in the header", () => {
    render(
      <Board
        applicants={all}
        now={DEMO_TODAY}
        strings={strings}
        filters={DEFAULT_FILTERS}
        onMove={() => undefined}
      />,
    );
    const board = screen.getByTestId("board");
    for (const stage of STAGES) {
      const column = board.querySelector(`[data-stage="${stage}"]`) as HTMLElement;
      expect(column).not.toBeNull();
      const count = all.filter((row) => row.stage === stage).length;
      expect(
        within(column).getByRole("heading", { name: `${strings.stageLabel[stage]} (${count})` }),
      ).toBeInTheDocument();
    }
  });

  it("shows name, role, days in stage and rating on a card", () => {
    const applicant = all[0];
    if (!applicant) throw new Error("seed is empty");
    render(
      <Board
        applicants={all}
        now={DEMO_TODAY}
        strings={strings}
        filters={DEFAULT_FILTERS}
        onMove={() => undefined}
      />,
    );
    const card = screen.getByRole("heading", { name: applicant.name }).closest("article");
    expect(card).not.toBeNull();
    const body = card as HTMLElement;
    expect(within(body).getByText(strings.roleLabel[applicant.roleId])).toBeInTheDocument();
    expect(
      within(body).getByText(strings.daysInStage(daysInStage(applicant, DEMO_TODAY))),
    ).toBeInTheDocument();
    expect(within(body).getByText(strings.rating(applicant.rating))).toBeInTheDocument();
  });

  it("shows an empty state when a column has no applicants", () => {
    const withoutHired = all.filter((row: Applicant) => row.stage !== "hired");
    render(
      <Board
        applicants={withoutHired}
        now={DEMO_TODAY}
        strings={strings}
        filters={DEFAULT_FILTERS}
        onMove={() => undefined}
      />,
    );
    const column = screen.getByTestId("board").querySelector('[data-stage="hired"]') as HTMLElement;
    expect(within(column).getByText(strings.emptyColumn)).toBeInTheDocument();
    expect(within(column).getByRole("heading", { level: 3 })).toHaveTextContent("Hired (0)");
  });
});
