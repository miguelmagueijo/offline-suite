<script lang="ts">
	import { X } from "@lucide/svelte";
	import type { PriceSide } from "../vat";
	import { DEFAULT_VAT, money } from "../vat";
	import { CART_GRID, type CartRow } from "../cart";

	interface Props {
		row: CartRow;
		onremove: () => void;
		onedit: () => void;
	}

	let { row = $bindable(), onremove, onedit }: Props = $props();

	const invalid = $derived(row.status === "invalid");

	function edited(side?: PriceSide) {
		if (side) row.lastEdited = side;
		row.status = "pending";
		row.error = undefined;
		onedit();
	}

	const cell =
		"no-spin h-8 w-full rounded-md border bg-white px-2 text-sm focus:border-violet-400 focus:ring-0 focus:outline-none dark:bg-slate-950";
	const border = $derived(
		invalid ? "border-red-400 dark:border-red-500/70" : "border-slate-200 dark:border-slate-800"
	);
	const mobileLabel =
		"mb-0.5 block text-[10px] font-semibold tracking-wide text-slate-500 uppercase sm:sr-only dark:text-slate-400";
</script>

<div
	class="{CART_GRID} items-end rounded-lg px-2 py-2 sm:items-center sm:py-1 {invalid
		? 'bg-red-50 dark:bg-red-500/10'
		: ''}"
	data-testid="cart-row"
	data-status={row.status}
	title={row.error}
>
	<!-- Phones: order puts name, amount and remove on the first line. -->
	<label class="order-1 col-span-2 min-w-0 sm:col-span-1">
		<span class="sr-only">Name</span>
		<input
			type="text"
			bind:value={row.name}
			oninput={() => edited()}
			placeholder="Item"
			aria-label="Name"
			class="{cell} {border}"
		/>
	</label>

	<label class="order-4 min-w-0 sm:order-1">
		<span class={mobileLabel}>VAT %</span>
		<input
			type="number"
			bind:value={row.vat}
			oninput={() => edited()}
			min="0"
			step="0.01"
			placeholder={String(DEFAULT_VAT)}
			aria-label="VAT percentage"
			class="{cell} {border} text-right"
		/>
	</label>

	<label class="order-4 min-w-0 sm:order-1">
		<span class={mobileLabel}>With VAT €</span>
		<input
			type="number"
			bind:value={row.gross}
			oninput={() => edited("gross")}
			min="0"
			step="0.01"
			placeholder="0.00"
			aria-label="Price with VAT"
			class="{cell} {border} text-right"
		/>
	</label>

	<label class="order-4 min-w-0 sm:order-1">
		<span class={mobileLabel}>Without VAT €</span>
		<input
			type="number"
			bind:value={row.net}
			oninput={() => edited("net")}
			min="0"
			step="0.01"
			placeholder="0.00"
			aria-label="Price without VAT"
			class="{cell} {border} text-right"
		/>
	</label>

	<div
		class="order-2 self-center text-right text-sm font-medium whitespace-nowrap tabular-nums sm:order-1 sm:pr-1"
		data-testid="row-amount"
	>
		{row.amount === null ? "—" : money(row.amount)}
	</div>

	<div class="order-3 self-center text-right sm:order-1">
		<button
			type="button"
			onclick={onremove}
			class="inline-flex size-8 items-center justify-center rounded-md text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-500/15 dark:hover:text-red-400"
			title="Remove item"
			aria-label="Remove item"
		>
			<X class="size-4" />
		</button>
	</div>
</div>
