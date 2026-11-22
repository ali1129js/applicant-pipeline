# Applicant Pipeline

A hiring pipeline board for the fictional company **Demo Talent GmbH**. Every applicant, role and note is generated demo data. Any resemblance to real people or organisations is coincidental.

The site is not deployed yet.

## Stack

Vite, React 19, TypeScript (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), Zod, Vitest and Testing Library.

Three gloss themes: Khaki, Graphite and Midnight. Graphite is the default. A motion toggle sits next to the theme switch; motion stays off until you turn it on, and `prefers-reduced-motion` forces static. The UI is English, with a German switch.

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm test
npm run build
npm run guard
```

## License

MIT
