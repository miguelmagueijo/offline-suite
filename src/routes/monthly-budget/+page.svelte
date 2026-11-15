<script lang="ts">
	import { onMount } from "svelte";
	import { Download, Plus, Trash2, TriangleAlert, Upload } from "@lucide/svelte";
	import {
		Budget,
		clearStorage,
		defaultBudget,
		downloadJSON,
		loadFromStorage,
		money,
		readBudgetFile,
		saveToStorage
	} from "./budget.svelte";
	import CategoryCard from "./components/CategoryCard.svelte";
	import NumberInput from "./components/NumberInput.svelte";
	import OverviewChip from "./components/OverviewChip.svelte";
	import ProgressBar from "./components/ProgressBar.svelte";

	const budget = new Budget();

	// The budget lives in localStorage, so only render once it's been loaded on the client.
	let ready = $state(false);

	onMount(() => {
		budget.load(loadFromStorage());
		ready = true;
	});

	// Set after clearing so resetting to defaults doesn't immediately write them back to storage.
	let skipNextSave = false;

	$effect(() => {
		const data = budget.toJSON();
		if (!ready) return;
		if (skipNextSave) {
			skipNextSave = false;
			return;
		}
		saveToStorage(data);
	});

	function onClear() {
		if (!confirm("Clear all monthly budget data from this browser? This cannot be undone.")) {
			return;
		}
		clearStorage();
		skipNextSave = true;
		budget.load(defaultBudget());
	}

	const trackedPercentage = $derived(
		budget.totalBudget > 0 ? (budget.totalTracked / budget.totalBudget) * 100 : 0
	);

	async function onImport(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		input.value = "";
		if (!file) return;
		try {
			budget.load(await readBudgetFile(file));
		} catch {
			alert("Could not import this JSON file.");
		}
	}

	const mainField =
		"h-10 rounded-md border border-slate-300 bg-white pr-8 pl-3 text-lg font-bold text-slate-900 shadow-xs placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:hover:border-slate-600 dark:focus:border-blue-400 dark:focus:ring-blue-400/25";
	const fieldLabel =
		"mb-1 block truncate text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400";
</script>

<svelte:head>
	<title>Monthly Budget · Offline Suite</title>
</svelte:head>

<div class="py-6">
	<header class="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight">Monthly Budget</h1>
			<p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
				Customize your budget percentages and track where every euro goes.
			</p>
		</div>

		<div class="grid grid-cols-3 gap-2 whitespace-nowrap sm:flex">
			<button
				type="button"
				onclick={() => downloadJSON(budget.toJSON())}
				class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-slate-800 px-3 text-sm text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
			>
				<Download class="size-4" />
				<span>Export<span class="max-sm:hidden">&nbsp;JSON</span></span>
			</button>

			<label
				class="inline-flex h-8 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
			>
				<Upload class="size-4" />
				<span>Import<span class="max-sm:hidden">&nbsp;JSON</span></span>
				<input
					type="file"
					accept=".json,application/json"
					class="hidden"
					onchange={onImport}
					data-testid="import-input"
				/>
			</label>

			<button
				type="button"
				onclick={onClear}
				class="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-sm text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/10"
				title="Remove all monthly budget data stored in this browser"
			>
				<Trash2 class="size-4" />
				<span>Clear<span class="max-sm:hidden">&nbsp;data</span></span>
			</button>
		</div>
	</header>

	{#if ready}
		<!-- Overview -->
		<section
			class="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
		>
			<div class="flex flex-col gap-3">
				<div
					class="flex items-end gap-2 border-b border-slate-100 pb-3 sm:gap-3 dark:border-slate-800"
				>
					<label class="block min-w-0 flex-1 sm:flex-none" title="Monthly net income">
						<span class={fieldLabel}>Monthly net income</span>
						<NumberInput
							bind:value={budget.income}
							blankZero
							step="0.01"
							placeholder="2500"
							suffix="€"
							suffixClass="right-3 text-sm font-medium"
							wrapperClass="w-full sm:w-44"
							class={mainField}
							data-testid="income"
						/>
					</label>

					<span class="flex h-10 shrink-0 items-center text-slate-400">
						<Plus class="size-5" />
					</span>

					<label
						class="block min-w-0 flex-1 sm:flex-none"
						title="Holiday + Christmas subsidies paid monthly"
					>
						<span class={fieldLabel}
							>Duodécimos<span class="max-sm:hidden">&nbsp;(monthly)</span></span
						>
						<NumberInput
							bind:value={budget.duodecimos}
							blankZero
							step="0.01"
							placeholder="0"
							suffix="€"
							suffixClass="right-3 text-sm font-medium"
							wrapperClass="w-full sm:w-44"
							class={mainField}
							data-testid="duodecimos"
						/>
					</label>
				</div>

				<div class="flex flex-wrap gap-2">
					{#each budget.all as category (category.id)}
						<OverviewChip
							{category}
							target={budget.target(category)}
							overAllocated={budget.overAllocated}
						/>
					{/each}
				</div>

				<div>
					<div
						class="mb-1.5 flex justify-between text-xs text-slate-500 dark:text-slate-400"
					>
						<span
							class="font-medium text-slate-700 dark:text-slate-300"
							data-testid="total-tracked">{money(budget.totalTracked)} tracked</span
						>
						<span>
							<span data-testid="total-unallocated"
								>{money(Math.max(0, budget.totalBudget - budget.totalTracked))} unallocated</span
							>
							·
							<span>{Math.round(trackedPercentage)}%</span>
						</span>
					</div>
					<ProgressBar value={trackedPercentage} testid="overall-progress" />
				</div>
			</div>

			{#if budget.overAllocated}
				<div
					class="mt-3 flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
					role="alert"
					data-testid="percent-warning"
				>
					<TriangleAlert class="size-3.5 shrink-0" />
					Percentages total {budget.totalPercentage}% — {budget.totalPercentage - 100}%
					over 100%. Reduce a category.
				</div>
			{/if}
		</section>

		<!-- Percentage-based categories -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			{#each budget.categories as category, i (category.id)}
				<CategoryCard
					bind:category={budget.categories[i]}
					target={budget.target(category)}
					overAllocated={budget.overAllocated}
					totalPercentage={budget.totalPercentage}
				/>
			{/each}
		</div>

		<hr class="my-6 border-t-2 border-slate-300 dark:border-slate-800" />

		<!-- Duodécimos -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<CategoryCard bind:category={budget.duo} target={budget.target(budget.duo)} />
		</div>
	{/if}
</div>
