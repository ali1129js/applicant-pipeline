import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "../lib/demo";
import { STRINGS } from "../lib/i18n";

const seed = generateApplicants({ referenceDate: DEMO_TODAY });
const applied = seed.find((row) => row.stage === "applied");
const hired = seed.find((row) => row.stage === "hired");
if (!applied || !hired) throw new Error("seed missing applied or hired");

function transfer() {
  const data: Record<string, string> = {};
  return {
    data: {
      setData: (key: string, value: string) => {
        data[key] = value;
      },
      getData: (key: string) => data[key] ?? "",
      effectAllowed: "move",
      dropEffect: "move",
    } as DataTransfer,
  };
}

describe("board moves", () => {
  it("moves a card with the keyboard select", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "screening");
    const screening = screen
      .getByTestId("board")
      .querySelector('[data-stage="screening"]') as HTMLElement;
    expect(within(screening).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });

  it("moves a card by drag and drop", () => {
    render(<App initialApplicants={seed} />);
    const card = screen.getByRole("heading", { name: applied.name }).closest("article");
    expect(card).not.toBeNull();
    const interview = screen
      .getByTestId("board")
      .querySelector('[data-stage="interview"]') as HTMLElement;
    const dt = transfer();
    fireEvent.dragStart(card as HTMLElement, { dataTransfer: dt.data });
    fireEvent.dragOver(interview, { dataTransfer: dt.data });
    fireEvent.drop(interview, { dataTransfer: dt.data });
    expect(within(interview).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });

  it("refuses to move a hired applicant and shows the reason", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(hired.name) });
    await user.selectOptions(select, "applied");
    expect(screen.getByRole("alert")).toHaveTextContent(STRINGS.en.moveError["hired-is-terminal"]);
    const hiredCol = screen
      .getByTestId("board")
      .querySelector('[data-stage="hired"]') as HTMLElement;
    expect(within(hiredCol).getByRole("heading", { name: hired.name })).toBeInTheDocument();
  });

  it("asks for a reason when moving to Rejected, and cancel leaves the card", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "rejected");
    const dialog = screen.getByRole("dialog", { name: STRINGS.en.rejectTitle });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByRole("button", { name: STRINGS.en.rejectCancel })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: STRINGS.en.rejectCancel }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    const appliedCol = screen
      .getByTestId("board")
      .querySelector('[data-stage="applied"]') as HTMLElement;
    expect(within(appliedCol).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });

  it("rejects an applicant after a reason is confirmed", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "rejected");
    await user.type(screen.getByLabelText(STRINGS.en.rejectReasonLabel), "Timing did not work.");
    await user.click(screen.getByRole("button", { name: STRINGS.en.rejectConfirm }));
    const rejected = screen
      .getByTestId("board")
      .querySelector('[data-stage="rejected"]') as HTMLElement;
    expect(within(rejected).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });
});
