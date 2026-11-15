<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { NumField } from "../vat";

	interface Props extends Omit<HTMLInputAttributes, "value" | "type"> {
		label: string;
		value: NumField;
		suffix: string;
		hint?: string;
	}

	let {
		label,
		value = $bindable(),
		suffix,
		hint,
		class: className = "",
		...rest
	}: Props = $props();
</script>

<label class="block">
	<span
		class="mb-1 block text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
	>
		{label}
	</span>
	<span class="relative block">
		<input
			type="number"
			bind:value
			class="no-spin h-10 w-full rounded-md border border-slate-300 bg-white pr-8 pl-3 text-lg font-bold text-slate-900 shadow-xs placeholder:font-normal placeholder:text-slate-400 hover:border-slate-400 focus:border-violet-500 focus:ring-3 focus:ring-violet-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 dark:hover:border-slate-600 dark:focus:border-violet-400 dark:focus:ring-violet-400/25 {className}"
			{...rest}
		/>
		<span
			class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm font-medium text-slate-400"
			>{suffix}</span
		>
	</span>
	{#if hint}
		<span class="mt-1 block text-xs text-slate-400 dark:text-slate-500">{hint}</span>
	{/if}
</label>
