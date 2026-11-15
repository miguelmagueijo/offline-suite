<script lang="ts">
	import { categorySpent, money, type Category } from "../budget.svelte";

	interface Props {
		category: Category;
		target: number;
		overAllocated?: boolean;
	}

	let { category, target, overAllocated = false }: Props = $props();

	const spent = $derived(categorySpent(category));
	const remaining = $derived(target - spent);
</script>

<div
	class="flex h-7 items-center gap-2 rounded-full border px-3 text-xs whitespace-nowrap {overAllocated
		? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-500/10'
		: 'border-slate-200 dark:border-slate-800'}"
	data-testid="overview-chip"
>
	<span class="size-2.5 rounded-full" style:background={category.color}></span>
	<span class="max-w-32 truncate font-semibold">{category.name}</span>
	{#if !category.fixed}
		<span
			class={overAllocated
				? "font-bold text-red-600 dark:text-red-400"
				: "text-slate-500 dark:text-slate-400"}>{Number(category.percentage)}%</span
		>
	{/if}
	<span
		class={remaining >= 0
			? "text-slate-500 dark:text-slate-400"
			: "font-medium text-red-500 dark:text-red-400"}
	>
		{remaining >= 0
			? `${money(spent)} / ${money(target)}`
			: `${money(Math.abs(remaining))} over`}
	</span>
</div>
