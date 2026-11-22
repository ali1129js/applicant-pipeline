import { useEffect, useState } from "react";
import { Board } from "./components/Board";
import { StatsStrip } from "./components/StatsStrip";
import { Toolbar } from "./components/Toolbar";
import { ConfirmDialog } from "./components/ConfirmDialog";
import { DetailDrawer } from "./components/DetailDrawer";
import { ReasonDialog } from "./components/ReasonDialog";
import { type MoveError } from "./domain/moves";
import { runGraphql } from "./graphql/execute";
import { generateApplicants } from "./domain/seed";
import type { Applicant, Stage } from "./domain/schemas";
import { useStoredState } from "./hooks/useStoredState";
import { DEMO_TODAY } from "./lib/demo";
import { parseFilters, serializeFilters, type BoardFilters } from "./lib/filters";
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
  const [openId, setOpenId] = useState<string | null>(null);
  const [filters, setFilters] = useState<BoardFilters>(() => parseFilters(window.location.search));

  function updateFilters(next: BoardFilters) {
    setFilters(next);
    const path = `${window.location.pathname}${serializeFilters(next)}${window.location.hash}`;
    window.history.replaceState(null, "", path);
  }

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

  function operate<T>(source: string, variableValues?: Record<string, unknown>) {
    return runGraphql<T>(source, { applicants, now }, variableValues);
  }

  function applyMove(id: string, to: Stage, reason?: string) {
    const result = operate<{ moveApplicant: { ok: boolean; error: string | null } }>(
      `mutation ($id: ID!, $to: Stage!, $reason: String) {
        moveApplicant(id: $id, to: $to, reason: $reason) { ok error }
      }`,
      reason === undefined ? { id, to } : { id, to, reason },
    );
    if (result.errors?.length) {
      setMoveMessage(result.errors[0]?.message ?? "GraphQL error");
      return;
    }
    const payload = result.data?.moveApplicant;
    if (!payload?.ok) {
      if (payload?.error === "rejected-needs-reason") {
        setPendingReject(id);
        setMoveMessage(null);
        return;
      }
      if (payload?.error === "hired-is-terminal" || payload?.error === "already-there") {
        const error: MoveError = payload.error;
        setMoveMessage(strings.moveError[error]);
        return;
      }
      setMoveMessage(payload?.error ?? strings.moveError["already-there"]);
      return;
    }
    commit(result.applicants);
    setMoveMessage(null);
    setPendingReject(null);
  }

  const pending = applicants.find((row) => row.id === pendingReject);
  const openApplicant = applicants.find((row) => row.id === openId);

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
        <StatsStrip applicants={applicants} now={now} strings={strings} />
        <h2 className="board-heading">{strings.boardHeading}</h2>
        <Toolbar filters={filters} onChange={updateFilters} strings={strings} />
        {moveMessage && (
          <p role="alert" className="move-alert">
            {moveMessage}
          </p>
        )}
        <Board
          applicants={applicants}
          now={now}
          strings={strings}
          filters={filters}
          onMove={applyMove}
          onOpen={setOpenId}
        />
        <p className="graphql-note">{strings.graphqlNote}</p>
      </main>
      {confirmReset && (
        <ConfirmDialog
          title={strings.resetTitle}
          body={strings.resetBody}
          confirmLabel={strings.resetConfirm}
          cancelLabel={strings.resetCancel}
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => {
            const result = operate<{ resetBoard: { id: string }[] }>("mutation { resetBoard { id } }");
            if (!result.errors) commit(result.applicants);
            setConfirmReset(false);
            setMoveMessage(null);
            setPendingReject(null);
            setOpenId(null);
          }}
        />
      )}
      {openApplicant && (
        <DetailDrawer
          applicant={openApplicant}
          locale={locale}
          strings={strings}
          onClose={() => setOpenId(null)}
          onAddNote={(body) => {
            const result = operate(
              `mutation ($id: ID!, $body: String!) { addNote(id: $id, body: $body) { id } }`,
              { id: openApplicant.id, body },
            );
            if (!result.errors) commit(result.applicants);
          }}
          onDeleteNote={(noteId) => {
            const result = operate(
              `mutation ($id: ID!, $noteId: ID!) { removeNote(id: $id, noteId: $noteId) { id } }`,
              { id: openApplicant.id, noteId },
            );
            if (!result.errors) commit(result.applicants);
          }}
          onSetRating={(rating) => {
            const result = operate(
              `mutation ($id: ID!, $rating: Int!) { setRating(id: $id, rating: $rating) { id } }`,
              { id: openApplicant.id, rating },
            );
            if (!result.errors) commit(result.applicants);
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
