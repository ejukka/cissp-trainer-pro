# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript check (tsc --noEmit)
```

There are no automated tests in this project.

## Architecture

**Next.js 15 App Router** — all routes live under `app/`. Each route is a single `page.tsx` file. The root layout (`app/layout.tsx`) wraps everything in `<Providers>` which sets up TanStack Query and the custom ThemeProvider.

**State management** uses four Zustand stores in `src/lib/store.ts`:
- `useProgressStore` — persisted (`cissp-progress`): quiz history, streaks, domain progress percentages, achievements, sessions (capped at 200), study time
- `useQuizStore` — in-memory only: active quiz state (domain, question index, answers, results, mode)
- `useSettingsStore` — persisted (`cissp-settings`): dailyGoal, showTimer, autoAdvance
- `useScheduleStore` — persisted (`cissp-schedule`): scheduled study sessions with default seed data

**Question data** is a static array exported from `src/data/questions.ts`. Each `Question` has `id`, `domainId` (1–8), `domain`, `question`, `choices[]`, `correctIndex`, `explanation`, `difficulty`, and `tags[]`. There are 8 CISSP domains; currently ~66 questions total.

**Theme** is managed by a custom `ThemeProvider` in `src/components/theme-provider.tsx` (not next-themes). It stores preference in localStorage under the key `'theme'` and applies `'dark'`/`'light'` as a class on `<html>`. Default is dark. Consume with `useTheme()` exported from the same file.

**QuizInterface** (`src/components/quiz-interface.tsx`) is the shared quiz UI used by `/practice`. It reads from `useQuizStore` to determine which domain/questions to show, writes answers/results back, and calls `useProgressStore` actions (`incrementQuestions`, `updateProgress`, `addSession`, `addStudyTime`) on completion.

**Exam simulator** (`app/exam-simulator/page.tsx`) is a standalone 50-question, 3-hour timed exam that does not use `QuizInterface` — it manages its own state locally and writes a session of mode `'exam'` to `useProgressStore` on submit or timeout.

**Achievements** (`app/achievements/page.tsx`) checks 14 badge definitions against `useProgressStore` state in a `useEffect` on mount and calls `addAchievement` for any newly unlocked ones.

## Key conventions

- Path alias `@/` maps to `src/` (configured in `tsconfig.json`)
- Tailwind dark mode uses the `class` strategy (`darkMode: ['class']` in `tailwind.config.ts`)
- Custom color palette: `primary` (blue/sky), `secondary` (violet), `accent` (emerald), `dark` (zinc)
- All page components and components that use browser APIs are `'use client'` — the app has no server components beyond the root layout metadata
- Framer Motion (`motion`, `AnimatePresence`) is used for transitions throughout; prefer the existing animation variants (`fade-up`, `fade-in`, `slide-in`) defined in `tailwind.config.ts`
