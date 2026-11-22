import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../App";
import { generateApplicants } from "../domain/seed";
import { DEMO_TODAY } from "../lib/demo";
import { STRINGS } from "../lib/i18n";
import { KEYS } from "../lib/storage";

const seed = generateApplicants({ referenceDate: DEMO_TODAY });
const applied = seed.find((row) => row.stage === "applied");
if (!applied) throw new Error("seed missing applied");

describe("demo persistence", () => {
  it("restores a moved card after a remount", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "screening");
    unmount();
    render(<App />);
    const screening = screen
      .getByTestId("board")
      .querySelector('[data-stage="screening"]') as HTMLElement;
    expect(within(screening).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });

  it("cancelling reset leaves the board unchanged", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "screening");
    await user.click(screen.getByRole("button", { name: STRINGS.en.resetDemo }));
    expect(screen.getByRole("button", { name: STRINGS.en.resetCancel })).toHaveFocus();
    await user.click(screen.getByRole("button", { name: STRINGS.en.resetCancel }));
    const screening = screen
      .getByTestId("board")
      .querySelector('[data-stage="screening"]') as HTMLElement;
    expect(within(screening).getByRole("heading", { name: applied.name })).toBeInTheDocument();
  });

  it("confirming reset restores the seeded board", async () => {
    const user = userEvent.setup();
    render(<App initialApplicants={seed} />);
    const select = screen.getByRole("combobox", { name: STRINGS.en.moveTo(applied.name) });
    await user.selectOptions(select, "screening");
    await user.click(screen.getByRole("button", { name: STRINGS.en.resetDemo }));
    await user.click(screen.getByRole("button", { name: STRINGS.en.resetConfirm }));
    const appliedCol = screen
      .getByTestId("board")
      .querySelector('[data-stage="applied"]') as HTMLElement;
    expect(within(appliedCol).getByRole("heading", { name: applied.name })).toBeInTheDocument();
    expect(localStorage.getItem(KEYS.board)).toBeTruthy();
  });
});
