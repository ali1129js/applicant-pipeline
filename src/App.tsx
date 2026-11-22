import { useEffect, useMemo, useState } from "react";
import { Board } from "./components/Board";
import { generateApplicants } from "./domain/seed";
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
  themeSchema,
} from "./lib/storage";
import type { LocaleName, MotionName, ThemeName } from "./lib/types";
import { LocaleToggle } from "./theme/LocaleToggle";
import { MotionToggle } from "./theme/MotionToggle";
import { ThemeSwitcher } from "./theme/ThemeSwitcher";
import { applyMotion, applyTheme, prefersReducedMotion } from "./theme/themes";

interface AppProps {
  now?: Date;
}

export function App({ now = DEMO_TODAY }: AppProps) {
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
  const [applicants] = useState(() => generateApplicants({ referenceDate: DEMO_TODAY }));
  const boardApplicants = useMemo(() => applicants, [applicants]);

  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () => applyMotion(motion, document.documentElement, reducedMotion),
    [motion, reducedMotion],
  );
  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = strings.documentTitle;
  }, [locale, strings.documentTitle]);

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
        </div>
      </header>
      <main id="main" className="app-main" tabIndex={-1}>
        <p className="board-note">{strings.fictionalNote}</p>
        <h2 className="board-heading">{strings.boardHeading}</h2>
        <Board applicants={boardApplicants} now={now} strings={strings} />
      </main>
    </div>
  );
}
