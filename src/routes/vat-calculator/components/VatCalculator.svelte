<script lang="ts">
	import { Calculator } from "@lucide/svelte";
	import { computeVat, DEFAULT_VAT, money, type NumField, type PriceSide } from "../vat";
	import PriceField from "./PriceField.svelte";

	let vat = $state<NumField>(DEFAULT_VAT);
	let net = $state<NumField>(null);
	let gross = $state<NumField>(null);
	let amount = $state<number | null>(null);
	let lastEdited = $state<PriceSide>("net");
	let error = $state("");

	function onsubmit(event: SubmitEvent) {
		event.preventDefault();
		const result = computeVat(vat, net, gross, lastEdited);
		if ("error" in result) {
			error = result.error;
			amount = null;
			return;
		}
		error = "";
		vat = result.vat;
		net = result.net;
		gross = result.gross;
		amount = result.amount;
	}
</script>

<form
	{onsubmit}
	novalidate
	class="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
	data-testid="vat-calculator"
>
	<h2 class="flex items-center gap-2 font-semibold">
		<Calculator class="size-4 text-slate-400" />
		Calculator
	</h2>

	<PriceField
		label="VAT"
		suffix="%"
		bind:value={vat}
		min="0"
		step="0.01"
		placeholder={String(DEFAULT_VAT)}
		hint="Defaults to {DEFAULT_VAT}% when left empty."
		data-testid="calc-vat"
	/>
	<PriceField
		label="Price without VAT"
		suffix="€"
		bind:value={net}
		oninput={() => (lastEdited = "net")}
		min="0"
		step="0.01"
		placeholder="0.00"
		data-testid="calc-net"
	/>
	<PriceField
		label="Price with VAT"
		suffix="€"
		bind:value={gross}
		oninput={() => (lastEdited = "gross")}
		min="0"
		step="0.01"
		placeholder="0.00"
		data-testid="calc-gross"
	/>

	<label class="block">
		<span
			class="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
		>
			VAT amount
		</span>
		<input
			type="text"
			readonly
			tabindex="-1"
			value={amount === null ? "" : money(amount)}
			placeholder="—"
			class="h-10 w-full cursor-default rounded-md border border-dashed border-slate-300 bg-transparent px-3 text-lg font-bold text-slate-700 focus:ring-0 dark:border-slate-700 dark:text-slate-200"
			data-testid="calc-amount"
		/>
	</label>

	{#if error}
		<p
			class="rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 dark:border-red-900 dark:bg-red-500/10 dark:text-red-400"
			role="alert"
		>
			{error}
		</p>
	{/if}

	<button
		type="submit"
		class="inline-flex h-10 items-center justify-center gap-1.5 rounded-md bg-slate-800 px-4 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300"
	>
		<Calculator class="size-4" />
		Calculate
	</button>

	<p class="text-xs text-slate-400 dark:text-slate-500">
		Fill in either price. If both are filled, the one you edited last is used.
	</p>
</form>
