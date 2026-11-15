<script lang="ts">
	import { Monitor, Moon, Sun } from "@lucide/svelte";
	import { theme } from "#lib/theme.svelte.js";

	const labels = { auto: "Auto", light: "Light", dark: "Dark" } as const;
	const icons = { auto: Monitor, light: Sun, dark: Moon } as const;

	const Icon = $derived(icons[theme.mode]);
</script>

<button
	type="button"
	onclick={() => theme.cycle()}
	class="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
	title="Theme: click to change"
	data-testid="theme-toggle"
>
	<Icon class="size-4" />
	{labels[theme.mode]}
</button>
