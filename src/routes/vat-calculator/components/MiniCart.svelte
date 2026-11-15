<script lang="ts">
	import { tick } from "svelte";
	import { Calculator, Plus, ShoppingCart, TriangleAlert } from "@lucide/svelte";
	import { computeVat, money, round2 } from "../vat";
	import { newRow, type CartRow, type CartTotals } from "../cart";
	import CartRowItem from "./CartRowItem.svelte";

	let rows = $state<CartRow[]>([newRow()]);
	/** Totals as of the last Calculate; null until the first one. */
	let totals = $state<CartTotals | null>(null);
	/** Something changed since the last Calculate. */
	let stale = $state(false);

	let rowsEl: HTMLDivElement | undefined = $state();

	const invalidCount = $derived(rows.filter((row) => row.status === "invalid").length);

	async function addRow() {
		rows.push(newRow());
		stale = true;
		await tick();
		rowsEl?.querySelector<HTMLInputElement>("[data-testid=cart-row]:last-child input")?.focus();
	}

	function removeRow(id: string) {
		rows = rows.filter((row) => row.id !== id);
		stale = true;
	}

	function calculate() {
		const sum = { gross: 0, net: 0, amount: 0, count: 0 };
		for (const row of rows) {
			const result = computeVat(row.vat, row.net, row.gross, row.lastEdited);
			if ("error" in result) {
				row.status = "invalid";
				row.error = result.error;
				row.amount = null;
				continue;
			}
			Object.assign(row, result, { status: "valid", error: undefined });
			sum.gross += result.gross;
			sum.net += result.net;
			sum.amount += result.amount;
			sum.count++;
		}
		totals = {
			gross: round2(sum.gross),
			net: round2(sum.net),
			amount: round2(sum.amount),
			count: sum.count
		};
		stale = false;
	}

	const th =
		"text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400";
	const totalLabel =
		"block text-[10px] font-semibold tracking-wide text-slate-500 uppercase sm:sr-only dark:text-slate-400";
</script>

<section
	class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
	data-testid="mini-cart"
>
	<div class="flex flex-wrap items-center justify-between gap-2">
		<h2 class="flex items-center gap-2 font-semibold">
			<ShoppingCart class="size-4 text-slate-400" />
			Mini cart
		</h2>
		<div class="flex gap-2 whitespace-nowrap">
			<button
				type="button"
				onclick={calculate}
				class="inline-flex h-8 items-center gap-1.5 rounded-md bg-slate-800 px-3 text-sm text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
			>
				<Calculator class="size-4" />
				Calculate
			</button>
		</div>
	</div>

	{#if invalidCount > 0}
		<p
			class="flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
			role="alert"
			data-testid="cart-invalid"
		>
			<TriangleAlert class="size-3.5 shrink-0" />
			{invalidCount}
			{invalidCount === 1 ? "row was" : "rows were"} skipped: each row needs a price with or without
			VAT.
		</p>
	{/if}

	<div class="-mx-2 flex flex-col">
		<!-- Column headings (sm and up; phones label each field instead) -->
		<div
			class="hidden grid-cols-[minmax(0,1fr)_4rem_6.5rem_6.5rem_5.5rem_2rem] gap-x-2 border-b border-slate-100 px-2 pb-2.5 sm:grid dark:border-slate-800"
			data-testid="cart-head"
		>
			<span class={th}>Name</span>
			<span class="{th} pr-2 text-right">VAT (%)</span>
			<span class="{th} pr-2 text-right">With VAT (€)</span>
			<span class="{th} pr-2 text-right">Without VAT (€)</span>
			<span class="{th} pr-1 text-right">VAT amount</span>
			<span class="sr-only">Actions</span>
		</div>

		<div
			bind:this={rowsEl}
			class="flex flex-col divide-y divide-slate-100 sm:divide-y-0 sm:pt-1.5 dark:divide-slate-800"
		>
			{#each rows as row, i (row.id)}
				<CartRowItem
					bind:row={rows[i]}
					onremove={() => removeRow(row.id)}
					onedit={() => (stale = true)}
				/>
			{/each}
		</div>

		<!-- Totals, separated from the last item by extra space and a divider -->
		<div
			class="mt-3 grid grid-cols-3 gap-x-2 gap-y-1 border-t-2 border-slate-200 px-2 pt-3 text-sm font-bold tabular-nums sm:grid-cols-[minmax(0,1fr)_4rem_6.5rem_6.5rem_5.5rem_2rem] dark:border-slate-700"
			data-testid="cart-totals"
		>
			<div class="col-span-3 sm:col-span-2">
				Total
				{#if totals}
					<span class="ml-1 text-xs font-normal text-slate-400">
						({totals.count}
						{totals.count === 1 ? "item" : "items"})
					</span>
				{/if}
			</div>
			<div class="sm:pr-2 sm:text-right">
				<span class={totalLabel}>With VAT</span>
				<span data-testid="total-gross">{totals ? money(totals.gross) : "—"}</span>
			</div>
			<div class="sm:pr-2 sm:text-right">
				<span class={totalLabel}>Without VAT</span>
				<span data-testid="total-net">{totals ? money(totals.net) : "—"}</span>
			</div>
			<div class="sm:pr-1 sm:text-right">
				<span class={totalLabel}>VAT amount</span>
				<span data-testid="total-amount">{totals ? money(totals.amount) : "—"}</span>
			</div>
		</div>
	</div>

	<button
		type="button"
		onclick={addRow}
		class="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
	>
		<Plus class="size-4" />
		Add item
	</button>

	{#if stale && totals}
		<p class="text-xs text-amber-600 dark:text-amber-400" data-testid="cart-stale">
			The cart changed since the last calculation. Press Calculate to update the totals.
		</p>
	{/if}
</section>
