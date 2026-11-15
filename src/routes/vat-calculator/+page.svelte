<script lang="ts">
	import MiniCart from "./components/MiniCart.svelte";
	import VatCalculator from "./components/VatCalculator.svelte";
</script>

<svelte:head>
	<title>VAT Calculator · Offline Suite</title>
</svelte:head>

<div class="py-6">
	<header class="mb-4">
		<h1 class="text-2xl font-bold tracking-tight">VAT Calculator</h1>
		<p class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
			Add or remove VAT from a price, or total up a small cart of items.
		</p>
	</header>

	<div class="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
		<VatCalculator />
		<MiniCart />
	</div>
</div>
