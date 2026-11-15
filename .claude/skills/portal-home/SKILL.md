---
name: portal-home
description: Spec for the oSuite portal: the home route "/" (app grid + search) and the shared shell around every app (navbar, theme toggle, footer, SEO head, robots/sitemap, branding). Read before changing src/routes/+page.svelte, +layout.svelte, layout.css, app.html, src/lib/*, robots.txt or sitemap.xml routes, or when adding a new app to the portal.
---

# Portal home (`/`) and shared shell

## Purpose

oSuite is a portal of small, private tools for personal organisation. The home page is only a
launcher: it lists the apps and gets out of the way. It must never contain app logic, and apps
must never import each other. The only place that knows every app is `src/lib/apps.ts`.

## What exists

| Area                 | File(s)                                                                        |
| -------------------- | ------------------------------------------------------------------------------ |
| App registry         | `src/lib/apps.ts` (`AppEntry`: href, name, description, icon, accent, tags)    |
| Home page            | `src/routes/+page.svelte`                                                      |
| Shell                | `src/routes/+layout.svelte` (sticky navbar, `<main>` container, footer)        |
| Footer               | `src/lib/components/SiteFooter.svelte`                                         |
| Logo                 | `src/lib/components/BrandLogo.svelte` (`static/logo.png` / `logo_light.png`)   |
| Theme                | `src/lib/theme.svelte.ts`, `src/lib/components/ThemeToggle.svelte`, `app.html` |
| SEO                  | `src/lib/seo.ts`, `src/lib/components/SeoHead.svelte`, `static/og-image.png`   |
| Crawlers             | `src/routes/robots.txt/+server.ts`, `src/routes/sitemap.xml/+server.ts`        |
| Palette / base CSS   | `src/routes/layout.css`                                                        |
| Favicons / manifests | `static/favicon/` (light OS), `static/favicon_light/` (dark OS)                |

## How it works

- **Home**: hero (big BrandLogo, "oSuite" h1, intro text), a search box that filters apps by name,
  description and tags (case-insensitive, `$derived`), a responsive grid of app cards
  (1 / 2 / 3 columns at base / sm / lg) linking via `resolve(app.href)`, and a dashed
  "More apps coming soon" tile shown only when the search is empty. "No apps match" message when
  a search has no results.
- **Shell layout**: `<div class="flex min-h-screen flex-col">` → sticky header → `<main
class="mx-auto flex w-full max-w-7xl grow flex-col px-4">` → footer. `main` is the shared
  container, so every app's content lines up with the navbar edges and the footer always sits at
  the bottom. Apps must not add their own max-width/horizontal padding wrapper.
- **Navbar**: BrandLogo + "oSuite" link home (`aria-current` on `/`), ThemeToggle on the right.
- **Theme**: Auto / Light / Dark cycle, stored in localStorage `offline-suite:theme`. `app.html`
  applies the `dark` class before first paint. Dark mode is class-based
  (`@custom-variant dark`). BrandLogo follows the site theme; favicons follow the OS theme.
- **Footer**: logo + name, "Apps" nav generated from `apps` (current app gets `aria-current` and
  bold), external repo link "Host it or improve it yourself!"
  (https://github.com/miguelmagueijo/offline-suite, `target=_blank rel="noopener noreferrer"`),
  and the AI-use disclaimer line (`data-testid="ai-disclaimer"`).
- **Palette**: ink `#070016` / paper `#F2EBFF`. Dark = paper text on ink, light = inverse. The
  Tailwind `slate` scale is re-tinted violet in `@theme` (slate-100 = paper, slate-950 = ink) and
  the accent colour is `violet-*`. Use slate/violet classes; don't hard-code other neutrals.
- **SEO**: every page renders `<SeoHead title? description? path />` (title, description,
  canonical, Open Graph, Twitter card). Absolute URLs come from `page.url.origin`, which
  adapter-node derives from the `ORIGIN` env var (production: https://osuite.miguelmagueijo.pt).
  Never hard-code the domain. The home page omits `title` and gets "oSuite: <tagline>".
- **robots.txt** (route, not static): allows major search engines, denies AI-training tokens and
  everyone else, ends with `Sitemap: <origin>/sitemap.xml`. **sitemap.xml** lists `/` plus every
  `apps` href.

## How it should work (invariants)

- Copy: private, local-only (no data sent to a server), open source, self-hostable.
- Adding an app = create `src/routes/<app>/` + add one `AppEntry` in `apps.ts`. Home grid, footer
  and sitemap pick it up automatically. Nothing else in the shell should need to change.
- Internal links use `resolve()` from `$app/paths`; static files use `asset()`.
- No horizontal overflow at any width; navbar, content and footer share the same edges.
- Works in light and dark with readable contrast; mobile first (test at 390px).

## Required tests

`src/routes/page.svelte.e2e.ts` and `src/routes/layout.svelte.e2e.ts` must keep passing and be
extended for new behaviour:

- portal lists apps, search filters them, card navigates to the app
- theme toggle cycles Auto→Light→Dark and persists across reload
- footer links to every app and the repo, sits at the bottom of a short page
- SEO tags, canonical, og:image, sitemap and robots use the serving origin
- footer shows the AI disclaimer
- layout (390 / 1024 / 1600px): app content edges match the navbar, no horizontal scroll,
  budget width doesn't change when content is added

When adding an app, add it to the SEO test's page list and the layout test's route list.
