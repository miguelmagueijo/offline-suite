<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	interface Props extends Omit<HTMLInputAttributes, "value" | "type" | "min" | "max"> {
		value: number;
		min?: number;
		max?: number;
		/** Show an empty field instead of "0". */
		blankZero?: boolean;
		/** Unit shown inside the field on the right (e.g. "€", "%"). */
		suffix?: string;
		suffixClass?: string;
		wrapperClass?: string;
		inputEl?: HTMLInputElement;
	}

	let {
		value = $bindable(),
		min = 0,
		max = Infinity,
		blankZero = false,
		suffix,
		suffixClass = "",
		wrapperClass = "",
		class: className = "",
		inputEl = $bindable(),
		...rest
	}: Props = $props();

	const display = (n: number) => (blankZero && !n ? "" : String(n));

	// Local text so partially typed values ("0.", "1.50") aren't clobbered by re-rendering the number.
	let text = $state(display(value));

	// Re-sync when the value is changed from outside (e.g. JSON import).
	$effect.pre(() => {
		if ((Number(text) || 0) !== value) text = display(value);
	});

	function oninput(event: Event & { currentTarget: HTMLInputElement }) {
		const raw = Number(event.currentTarget.value);
		const next = Math.max(min, Math.min(max, Number.isFinite(raw) ? raw : 0));
		text = event.currentTarget.value;
		if (next !== raw && event.currentTarget.value !== "") {
			text = String(next);
			event.currentTarget.value = text;
		}
		value = next;
	}
</script>

<span class="relative block {wrapperClass}">
	<input
		bind:this={inputEl}
		type="number"
		{min}
		max={Number.isFinite(max) ? max : undefined}
		value={text}
		{oninput}
		class="no-spin w-full {className}"
		{...rest}
	/>
	{#if suffix}
		<span
			class="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-slate-400 {suffixClass}"
			>{suffix}</span
		>
	{/if}
</span>

<style>
	.no-spin::-webkit-outer-spin-button,
	.no-spin::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.no-spin {
		-moz-appearance: textfield;
		appearance: textfield;
	}
</style>
