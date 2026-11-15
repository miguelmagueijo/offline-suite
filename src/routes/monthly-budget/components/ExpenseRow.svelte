<script lang="ts">
	import { X } from "@lucide/svelte";
	import type { Expense } from "../budget.svelte";
	import NumberInput from "./NumberInput.svelte";

	interface Props {
		expense: Expense;
		/** Category target, used to show what share of it this expense takes. */
		target: number;
		onremove: () => void;
	}

	let { expense = $bindable(), target, onremove }: Props = $props();

	const share = $derived.by(() => {
		const amount = Number(expense.amount) || 0;
		if (amount <= 0 || target <= 0) return "";
		const pct = (amount / target) * 100;
		return `${pct < 1 ? "<1" : Math.round(pct)}%`;
	});
</script>

<div class="flex items-center gap-2" data-testid="expense-row">
	<input
		type="text"
		bind:value={expense.name}
		placeholder="Expense"
		data-expense-name
		class="h-7 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-2 text-sm focus:border-blue-400 focus:ring-0 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:placeholder:text-slate-600"
	/>

	<NumberInput
		bind:value={expense.amount}
		step="0.01"
		suffix="€"
		suffixClass="text-xs"
		wrapperClass="w-20 shrink-0"
		aria-label="Amount"
		class="h-7 rounded-md border border-slate-200 bg-white pr-6 pl-2 text-right text-sm focus:border-blue-400 focus:ring-0 focus:outline-none dark:border-slate-800 dark:bg-slate-950"
	/>

	<span
		class="w-9 shrink-0 text-right text-[11px] leading-none text-slate-500 tabular-nums dark:text-slate-400"
		>{share}</span
	>

	<button
		type="button"
		onclick={onremove}
		class="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/15 dark:hover:text-red-400"
		title="Delete expense"
		aria-label="Delete expense"
	>
		<X class="size-3.5" />
	</button>
</div>
