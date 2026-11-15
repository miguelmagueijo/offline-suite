---
name: vat-calculator
description: Spec for the VAT Calculator app at /vat-calculator: a single-price VAT calculator (left) and a mini cart with per-row VAT and totals (right). Read before changing anything in src/routes/vat-calculator/.
---

# VAT Calculator (`/vat-calculator`)

## Purpose

Add or remove VAT from a price, and total up a small list of items with mixed VAT rates.
Portuguese default rate (23%). Nothing is stored or sent anywhere; the cart lives in memory only.

## What exists

| File                              | Role                                                                   |
| --------------------------------- | ---------------------------------------------------------------------- |
| `+page.svelte`                    | Header + 2-column grid (calculator 1fr, cart 2fr on lg; stacked below) |
| `vat.ts`                          | `DEFAULT_VAT`, `computeVat`, `money`, `round2`, `isFilled`, types      |
| `cart.ts`                         | `CartRow`, `CartTotals`, `newRow()`, `CART_GRID` column template       |
| `components/VatCalculator.svelte` | Left column form                                                       |
| `components/PriceField.svelte`    | Labelled number field with suffix                                      |
| `components/MiniCart.svelte`      | Cart: Calculate, header, rows, totals, add item, stale notice          |
| `components/CartRowItem.svelte`   | One editable cart row                                                  |
| `page.svelte.e2e.ts`              | Playwright tests                                                       |

Components live only in this route's `components/` folder; never import them from other apps.

## Core rule: `computeVat(vat, net, gross, prefer)`

- Empty VAT → 23 (`DEFAULT_VAT`), always. Negative VAT or price → error.
- No price → error "Fill in a price with or without VAT."
- One price filled → compute the other: `gross = net × (1 + vat/100)`, `net = gross / (1 + vat/100)`.
- Both filled → the one edited last (`prefer` / `lastEdited`) wins and the other is recomputed.
- All results rounded to 2 decimals; `amount = gross − net`.
- `money()` formats as `1,250.00€` (euro sign after the amount).

## How it works

- **Calculator (left)**: fields VAT % (placeholder 23, hint "Defaults to 23% when left empty"),
  Price without VAT, Price with VAT, read-only VAT amount (€), then a full-width Calculate button
  (form submit, so Enter works). Shows an error alert on invalid input. Tracks which price was
  edited last.
- **Mini cart (right)**: Calculate button at the top. Column order: Name, VAT (%), With VAT (€),
  Without VAT (€), VAT amount, remove. VAT column is narrow (4rem). Rows start with VAT 23.
    - Calculate computes only valid rows; invalid rows get `status="invalid"`, red highlight, a
      tooltip with the error, and an alert "N rows were skipped…". Valid rows get their missing
      price and amount filled in.
    - Totals row below the rows, separated by extra space and a thicker divider: item count, sum of
      With VAT, Without VAT and VAT amount. No VAT % total, no name total. Shows "—" before the first
      Calculate.
    - Editing a row sets it back to `pending`; any change after a Calculate shows the amber
      "cart changed" notice until Calculate is pressed again.
    - "Add item" (dashed) appends a row and focuses its name.
    - Phones: header hidden; each row is 2 lines (name + amount + remove, then VAT % / With /
      Without with small labels). Totals show three labelled values.

## How it should work (invariants)

- No persistence and no network; pure client-side calculation.
- Number inputs bind as `null` when empty; treat null as "not filled", never as 0.
- Focused fields stay readable in both themes; no spinner arrows (`no-spin` utility).
- No horizontal scroll at 390px; the cart must fit a phone.
- Keep the app about VAT: new features should serve VAT/price calculation.

## Required tests (`page.svelte.e2e.ts`)

Keep these passing and add one per new behaviour:

- calculator: net → gross, gross → net, empty VAT uses 23, last edited price wins, error with no
  price
- mini cart: computes valid rows, highlights invalid ones, invalid count alert, totals, stale
  notice after edits, remove row
- mini cart fits a 390px screen with per-field labels and no horizontal overflow

Run: `npm run lint && npm run check && npx playwright test src/routes/vat-calculator`.
