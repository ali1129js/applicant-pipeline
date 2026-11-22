import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { ReasonDialog } from "./components/ReasonDialog";
import { moveApplicant, type MoveError } from "./domain/moves";
import { generateApplicants } from "./domain/seed";
import type { Applicant, Stage } from "./domain/schemas";
import { useStoredState } from "./hooks/useStoredState";
import { DEMO_TODAY } from "./lib/demo";
import { STRINGS } from "./lib/i18n";
import {
  KEYS,
  defaultLocale,
  defaultMotion,
  defaultTheme,
  localeSchema,
  motionSchema,
  readBoard,
  themeSchema,
  writeBoard,
} from "./lib/storage";
import type { LocaleName, MotionName, ThemeName } from "./lib/types";
import { LocaleToggle } from "./theme/LocaleToggle";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

interface AppProps {
  now?: Date;
  initialApplicants?: Applicant[];
}

function replaceApplicant(list: readonly Applicant[], next: Applicant): Applicant[] {
  return list.map((row) => (row.id === next.id ? next : row));
}

export function App({ now = DEMO_TODAY, initialApplicants }: AppProps) {
  const [theme, setTheme] = useStoredState<ThemeName>(KEYS.theme, themeSchema, defaultTheme());
  const [motion, setMotion] = useStoredState<MotionName>(
    KEYS.motion,
    motionSchema,
    defaultMotion(),
  );
  const [locale, setLocale] = useStoredState<LocaleName>(
    KEYS.locale,
    localeSchema,
    defaultLocale(),
  );
  const reducedMotion = prefersReducedMotion();
  const strings = STRINGS[locale];
  const seedBoard = () => generateApplicants({ referenceDate: DEMO_TODAY });
  const [applicants, setApplicants] = useState<Applicant[]>(
    () => initialApplicants ?? readBoard(seedBoard),
  );
  const [moveMessage, setMoveMessage] = useState<string | null>(null);
  const [pendingReject, setPendingReject] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function commit(next: Applicant[]) {
    setApplicants(next);
    writeBoard(next);
  }

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = strings.documentTitle;
  }, [locale, strings.documentTitle]);

  function applyMove(id: string, to: Stage, reason?: string) {
    const current = applicants.find((row) => row.id === id);
    if (!current) return;
    const result = moveApplicant(
      current,
      reason === undefined ? { to, at: now } : { to, at: now, reason },
    );
    if (!result.ok) {
      if (result.error === "rejected-needs-reason") {
        setPendingReject(id);
        setMoveMessage(null);
        return;
      }
      const error: MoveError = result.error;
      setMoveMessage(strings.moveError[error]);
      return;
    }
    commit(replaceApplicant(applicants, result.applicant));
    setMoveMessage(null);
    setPendingReject(null);
  }

  const pending = applicants.find((row) => row.id === pendingReject);

  return (
    <div className="app">
      <a className="skip-link" href="#main">
        {strings.skipToContent}
      </a>
      <header className="app-header">
        <div>
          <h1 className="app-title">{strings.title}</h1>
          <p className="app-sub">
            {strings.company} · {strings.subtitle}
          </p>
        </div>
        <div className="theme-tools">
          <LocaleToggle value={locale} onChange={setLocale} strings={strings} />
          <ThemeSwitcher value={theme} onChange={setTheme} strings={strings} />
          <MotionToggle
            value={motion}
            onChange={setMotion}
            reducedMotion={reducedMotion}
            strings={strings}
          />
          <button type="button" className="button" onClick={() => setConfirmReset(true)}>
            {strings.resetDemo}
          </button>
        </div>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <p className="board-note">{strings.fictionalNote}</p>
        <h2 className="board-heading">{strings.boardHeading}</h2>
        {moveMessage && (
          <p role="alert" className="move-alert">
            {moveMessage}
          </p>
        )}
        <Board applicants={applicants} now={now} strings={strings} onMove={applyMove} />
      </main>
      {confirmReset && (
        <ConfirmDialog
          title={strings.resetTitle}
          body={strings.resetBody}
          confirmLabel={strings.resetConfirm}
          cancelLabel={strings.resetCancel}
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            commit(seedBoard());
            setConfirmReset(false);
            setMoveMessage(null);
            setPendingReject(null);
          }}
        />
      )}
      {pending && (
        <ReasonDialog
          name={pending.name}
          strings={strings}
          onCancel={() => setPendingReject(null)}
          onConfirm={(reason) => applyMove(pending.id, "rejected", reason)}
        />
      )}
    </div>
  );
}
