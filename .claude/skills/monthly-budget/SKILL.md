---
name: monthly-budget
description: Spec for the Monthly Budget app at /monthly-budget: income + duodécimos + up to two extra incomes, percentage categories with expenses, overview, localStorage persistence, JSON import/export and clear. Read before changing anything in src/routes/monthly-budget/.
---

# Monthly Budget (`/monthly-budget`)

## Purpose

A personal monthly planner: split the net income into percentage categories (50/30/20 by
default) and track expenses against each one. Fixed incomes (duodécimos and extra incomes) get
their own cards whose target is their amount. Everything stays in the browser.

Origin: ported from `templates/budgetplanner.html`; that file is reference only, not used at
runtime.

## What exists

| File                             | Role                                                                         |
| -------------------------------- | ---------------------------------------------------------------------------- |
| `+page.svelte`                   | Page: header actions, overview, income fields, category grids                |
| `budget.svelte.ts`               | Types, parsing/normalising, `Budget` class (runes), storage and file helpers |
| `components/CategoryCard.svelte` | Card: colour, name, % (non-fixed only), target, progress, expenses           |
| `components/ExpenseRow.svelte`   | Expense name, amount, share of target %, delete                              |
| `components/OverviewChip.svelte` | Summary chip per category                                                    |
| `components/ProgressBar.svelte`  | `role="progressbar"`, optional colour                                        |
| `components/NumberInput.svelte`  | Bindable number field with min/max clamp, `blankZero`, suffix                |
| `page.svelte.e2e.ts`             | Playwright tests                                                             |

Components live only in this route's `components/` folder; never import them from other apps.

## Data model (`BudgetData`)

```ts
{ income, duodecimos, duo: Category, extraIncomes: Category[], categories: Category[] }
Category { id, name, percentage, color, description, fixed?, amount?, expenses: Expense[] }
Expense  { id, name, amount }
```

- `duo` (id `duodecimos`) and `extraIncomes` are `fixed: true`; they show no percentage field.
- Target: `fixed` → `category.amount ?? budget.duodecimos`; otherwise `income × percentage / 100`.
- `totalBudget = income + duodecimos + Σ extraIncomes.amount`. Percentages apply to `income` only.
- `parseBudget()` validates any stored or imported object (returns null if not a budget), clamps
  numbers ≥ 0, percentages 0–100, colours to `#RRGGBB`, caps extra incomes at
  `MAX_EXTRA_INCOMES` (2), and fills missing fields. Old files without `extraIncomes` must load.
- localStorage key `offline-suite:monthly-budget`. Export adds `version` (`EXPORT_VERSION`, now 4)
  and `exportedAt`; bump the version when the shape changes and keep parsing older shapes.

## How it works

- The page renders only after `onMount` loads from storage (`ready`), to avoid SSR/default flash.
- A `$effect` saves `budget.toJSON()` on every change; `skipNextSave` stops Clear from re-saving
  the defaults right after removing the key.
- Header buttons: Export JSON (download `budget-planner.json`), Import JSON (file input;
  `alert` on invalid file), Clear data (`confirm`, removes key, resets to defaults). On phones they
  are a 3-column grid with short labels (Export / Import / Clear).
- Income row: Monthly net income + Duodécimos + extra income fields, joined by "+" on sm+, a
  2-column grid on phones. "Add income" button (dashed) adds an extra income (named
  "Extra income N" using the lowest free N, colour pink then teal), focuses its field, and
  disappears at 2. Each extra field has an × to remove it. The field label is the card name.
- Overview: one chip per category (`all` = categories, duo, extras), tracked total, unallocated
  total and overall progress. Red warning when category percentages total > 100%.
- Grids: percentage categories (3 columns on lg), a divider, then duodécimos + extra incomes side
  by side in the same 3-column grid.
- Card: editable colour and name; percentage field (non-fixed) is aligned with the target amount
  below it and turns red when over-allocated; "Used x / target", progress bar, "remaining" or
  "over budget" in the category colour (red when over). "Add expense" appends and focuses a row.
- Money format: `money()` → `1,250.00€` (euro sign after the amount).

## How it should work (invariants)

- Never send data anywhere; only localStorage and user-initiated file download/upload.
- Number inputs must not clobber partially typed decimals (NumberInput keeps local text).
- Adding content must not change the page width (content lives in the layout `<main>`).
- Fields stay readable when focused in both themes (constant background + violet ring).
- Mobile: no horizontal scroll at 390px.
- Keep it a budget planner: new features should serve monthly income/expense planning.

## Required tests (`page.svelte.e2e.ts`)

`beforeEach` clears localStorage. Keep these passing and add one per new behaviour:

- default categories and targets render (3 categories + duodécimos = 4 cards / chips)
- adding/editing/deleting expenses updates spent, remaining, share %, tracked and unallocated
- over-100% warning appears/disappears; percentage is clamped to 100
- duodécimos card uses the duodécimos amount as target and has no percentage field
- typing decimals in income isn't clobbered
- state persists across reloads
- export → import round-trips; invalid import is rejected
- clear data removes the key and resets to defaults
- extra incomes: add (focus, card, name), limit of 2, totals, rename syncs label, persists, remove
  frees the name

Run: `npm run lint && npm run check && npx playwright test src/routes/monthly-budget`.
