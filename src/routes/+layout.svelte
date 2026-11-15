<script lang="ts">
	import "./layout.css";
	import { onMount } from "svelte";
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { LayoutGrid } from "@lucide/svelte";
	import favicon from "#lib/assets/favicon.svg";
	import SiteFooter from "#lib/components/SiteFooter.svelte";
	import ThemeToggle from "#lib/components/ThemeToggle.svelte";
	import { theme } from "#lib/theme.svelte.js";
	import type { LayoutProps } from "./$types";

	let { children }: LayoutProps = $props();

	onMount(() => theme.init());

	const isHome = $derived(page.url.pathname === "/");
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<header
		class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80"
	>
		<div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
			<a
				href={resolve("/")}
				class="inline-flex items-center gap-2 text-lg font-bold tracking-tight"
				aria-current={isHome ? "page" : undefined}
			>
				<LayoutGrid class="size-5 text-blue-600 dark:text-blue-400" />
				Offline Suite
			</a>
			<ThemeToggle />
		</div>
	</header>

	<!-- Shared container: matches the navbar/footer width and side padding for every app. -->
	<main class="mx-auto flex w-full max-w-7xl grow flex-col px-4">
		{@render children()}
	</main>

	<SiteFooter />
</div>
