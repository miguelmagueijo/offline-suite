<script lang="ts">
	import { tick } from "svelte";
	import { Plus } from "@lucide/svelte";
	import { categorySpent, generateId, money, type Category } from "../budget.svelte";
	import ExpenseRow from "./ExpenseRow.svelte";
	import NumberInput from "./NumberInput.svelte";
	import ProgressBar from "./ProgressBar.svelte";

	interface Props {
		category: Category;
		target: number;
		/** Total percentage across categories exceeds 100%. */
		overAllocated?: boolean;
		totalPercentage?: number;
	}

	let {
		category = $bindable(),
		target,
		overAllocated = false,
		totalPercentage = 0
	}: Props = $props();

	let expensesEl: HTMLDivElement | undefined = $state();

	const spent = $derived(categorySpent(category));
	const remaining = $derived(target - spent);
	const progress = $derived(target > 0 ? Math.min((spent / target) * 100, 100) : 0);

	async function addExpense() {
		category.expenses.push({ id: generateId(), name: "", amount: 0 });
		await tick();
		const inputs = expensesEl?.querySelectorAll<HTMLInputElement>("[data-expense-name]");
		inputs?.[inputs.length - 1]?.focus();
	}

	function removeExpense(id: string) {
		category.expenses = category.expenses.filter((expense) => expense.id !== id);
	}
</script>

<section
	class="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
	data-testid="category-card"
>
	<div class="border-b border-slate-100 p-4 dark:border-slate-800">
		<div class="flex items-center gap-2">
			<input
				type="color"
				bind:value={category.color}
				class="color-swatch size-5 shrink-0 cursor-pointer rounded-full"
				title="Change color"
				aria-label="Category color"
			/>

			<input
				type="text"
				bind:value={category.name}
				placeholder="Title"
				aria-label="Category name"
				class="h-8 min-w-0 flex-1 rounded-md border border-transparent bg-transparent px-2 text-base font-bold hover:border-slate-200 focus:border-violet-400 focus:ring-0 focus:outline-none dark:hover:border-slate-700"
			/>

			{#if category.fixed}
				<div
					class="flex h-8 shrink-0 items-center pr-2 text-[11px] font-semibold tracking-wide text-slate-400 uppercase"
				>
					Fixed
				</div>
			{:else}
				<NumberInput
					bind:value={category.percentage}
					max={100}
					step="1"
					suffix="%"
					suffixClass="text-sm {overAllocated ? 'text-red-500' : ''}"
					wrapperClass="w-20 shrink-0"
					aria-label="Category percentage"
					title={overAllocated ? `Total is ${totalPercentage}% (over 100%)` : ""}
					class="h-8 rounded-md border pr-6 pl-2 text-right text-base font-bold focus:ring-0 focus:outline-none {overAllocated
						? 'border-red-400 bg-red-50 text-red-600 dark:border-red-400 dark:bg-red-500/10 dark:text-red-400'
						: 'border-transparent bg-transparent hover:border-slate-200 focus:border-violet-400 dark:hover:border-slate-700'}"
				/>
			{/if}
		</div>

		<div class="mt-1 text-right text-xs text-slate-500 dark:text-slate-400">
			{money(target)}
		</div>

		<div class="mt-3">
			<div class="mb-1.5 flex justify-between text-xs">
				<span class="text-slate-500 dark:text-slate-400">Used</span>
				<span>
					<strong data-testid="category-spent">{money(spent)}</strong>
					/
					<strong>{money(target)}</strong>
				</span>
			</div>

			<ProgressBar value={progress} color={category.color} />

			<div
				class="mt-2 text-xs font-medium"
				style:color={remaining >= 0 ? category.color : "#dc2626"}
				data-testid="category-remaining"
			>
				{remaining >= 0
					? `${money(remaining)} remaining`
					: `${money(Math.abs(remaining))} over budget`}
			</div>
		</div>
	</div>

	<div class="flex flex-col gap-2 p-4">
		<div bind:this={expensesEl} class="flex flex-col gap-2 empty:hidden">
			{#each category.expenses as expense, i (expense.id)}
				<ExpenseRow
					bind:expense={category.expenses[i]}
					{target}
					onremove={() => removeExpense(expense.id)}
				/>
			{/each}
		</div>

		<button
			type="button"
			onclick={addExpense}
			class="inline-flex h-8 w-full items-center justify-center gap-1 rounded-md border border-dashed border-slate-300 text-sm text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:border-slate-500 dark:hover:text-slate-200"
		>
			<Plus class="size-4" />
			Add expense
		</button>
	</div>
</section>

<style>
	.color-swatch {
		appearance: none;
		-webkit-appearance: none;
		padding: 0;
		border: 0;
		background: transparent;
	}

	.color-swatch::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.color-swatch::-webkit-color-swatch {
		border: 0;
		border-radius: 9999px;
	}

	.color-swatch::-moz-color-swatch {
		border: 0;
		border-radius: 9999px;
	}
</style>
