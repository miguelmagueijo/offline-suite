# oSuite (offline-suite)

A portal of small, private, browser-only tools for personal organization. Every "app" is just a
SvelteKit route; the portal (`/`) lists them. Data should never leave the device (localStorage only, no
backend calls).

## Work from the app skills first

Each route has a skill that describes what exists, how it works, how it should work, and the
tests it requires. **Before changing an app, load its skill instead of re-reading all its code**,
then open only the files the skill points to for the change at hand.

| Route             | Skill            | Covers                                                          |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| `/` + shell       | `portal-home`    | home grid, navbar, footer, theme, palette, SEO, robots, sitemap |
| `/monthly-budget` | `monthly-budget` | budget planner                                                  |
| `/vat-calculator` | `vat-calculator` | VAT calculator + mini cart                                      |

- If the code and the skill disagree, check with the user which one is right, then fix the other.
- When a change alters behavior, files, data shape or tests, **update the skill in the same
  change**. Adding a new app means adding a new skill (same structure) and a row above.
- If a new app is requested, create the skill if it is not created yet.

## Keep each app focused

- Each app does one job (plan a monthly budget, calculate VAT). New features must serve that job;
  if a request drifts away from it, say so and suggest a separate app instead.
- Apps are independent: never import from another app's route folder. Shared code goes in
  `src/lib/` only when it is genuinely app-agnostic (shell, theme, SEO, registry).
- App-specific components live in `src/routes/<app>/components/`.
- The portal only knows apps through `src/lib/apps.ts`.

## Stack

- SvelteKit 3 + Svelte 5 (runes only: `$state`, `$derived`, `$effect`, `$props`, `$bindable`)
- TypeScript, Vite 8, `@sveltejs/adapter-node` (Docker + compose on a VPS, `deploy.sh`)
- Tailwind CSS 4 with `@tailwindcss/forms` and `@tailwindcss/typography`; class-based dark mode
- Icons: `@lucide/svelte`
- Tests: Playwright e2e (`*.e2e.ts` next to each route), against `build && preview`
- Lint/format: ESLint (+ eslint-plugin-svelte) and Prettier (+ svelte and tailwind plugins)
- Node 24, pnpm (npm scripts work too)

## Requirements and conventions

- **Private and local**: no network requests for user data, no analytics, no server state.
  Persist with localStorage under `offline-suite:<app>` keys (don't rename existing keys).
- **Mobile first**: everything must work at 390px with no horizontal scroll, and in light and dark.
- **Layout**: app content goes straight into the layout's `<main>` (shared max width and
  padding). Don't add another page-width wrapper.
- **Branding**: name is "oSuite" (package name stays `offline-suite`). Palette ink `#070016` /
  paper `#F2EBFF`; use the re-tinted `slate-*` neutrals and `violet-*` accent.
- **Money**: show amounts as `1,250.00€` (euro sign after).
- **SEO**: every page renders `SeoHead`; absolute URLs come from the request origin (`ORIGIN`),
  never a hard-coded domain.
- **Formatting**: tabs (width 4), double quotes, no trailing commas, print width 100.
- **SvelteKit specifics**: internal links with `resolve()` and static files with `asset()` from
  `$app/paths`; `page` from `$app/state`; `#lib/*` imports need the `.js` extension for TS files
  (e.g. `#lib/apps.js`).
- **Tests**: every behavior change comes with a Playwright test; keep the skill's test list in
  sync.

## Commands

```sh
npm run dev       # dev server
npm run lint      # prettier --check + eslint
npm run check     # svelte-check
npx playwright test [path]   # e2e (builds and previews first)
npm run format    # prettier --write
```

Before finishing a change: `npm run lint && npm run check && npx playwright test` must pass.
Commit only when asked; end commit messages with the Co-Authored-By line.
