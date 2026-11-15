<script lang="ts">
	import { ArrowUpRight, Search, Sparkles } from "@lucide/svelte";
	import { resolve } from "$app/paths";
	import { apps } from "#lib/apps.js";
	import BrandLogo from "#lib/components/BrandLogo.svelte";
	import SeoHead from "#lib/components/SeoHead.svelte";

	let query = $state("");

	const filtered = $derived.by(() => {
		const q = query.trim().toLowerCase();
		if (!q) return apps;
		return apps.filter((app) =>
			[app.name, app.description, ...(app.tags ?? [])].some((text) =>
				text.toLowerCase().includes(q)
			)
		);
	});
</script>

<SeoHead path="/" />

<div class="relative grow overflow-hidden">
	<!-- Decorative dotted background -->
	<div
		aria-hidden="true"
		class="pointer-events-none absolute inset-0 [background-image:radial-gradient(var(--color-slate-300)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] [background-size:22px_22px] dark:[background-image:radial-gradient(var(--color-slate-800)_1px,transparent_1px)]"
	></div>

	<div class="relative pt-16 pb-20">
		<section class="flex flex-col items-center text-center">
			<BrandLogo class="size-20 drop-shadow-[0_8px_24px_rgb(124_58_237/0.35)] sm:size-24" />
			<h1 class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">oSuite</h1>
			<p class="mx-auto mt-3 max-w-xl text-slate-500 dark:text-slate-400">
				Small, open-source tools to help you organise your life. Everything runs in your
				browser and nothing is sent to a server. Use it here or host it yourself.
			</p>

			<label class="relative mt-8 block w-full max-w-md">
				<span class="sr-only">Search apps</span>
				<Search
					class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400"
				/>
				<input
					type="search"
					bind:value={query}
					placeholder="Search apps…"
					class="h-10 w-full rounded-lg border-slate-300 bg-white pl-9 text-sm shadow-sm focus:border-violet-500 focus:ring-violet-200 dark:border-slate-700 dark:bg-slate-900 dark:placeholder:text-slate-500 dark:focus:ring-violet-500/30"
				/>
			</label>
		</section>

		<ul class="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as app (app.href)}
				{@const Icon = app.icon}
				<li>
					<a
						href={resolve(app.href)}
						class="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:outline-none dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
					>
						<div class="flex items-start justify-between">
							<span
								class="inline-flex size-11 items-center justify-center rounded-xl {app.accent}"
							>
								<Icon class="size-5" />
							</span>
							<ArrowUpRight
								class="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-slate-500 dark:text-slate-600 dark:group-hover:text-slate-300"
							/>
						</div>
						<h2 class="mt-4 font-semibold">{app.name}</h2>
						<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
							{app.description}
						</p>
						{#if app.tags?.length}
							<div class="mt-4 flex flex-wrap gap-1.5">
								{#each app.tags as tag (tag)}
									<span
										class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
										>{tag}</span
									>
								{/each}
							</div>
						{/if}
					</a>
				</li>
			{/each}

			{#if !query}
				<li
					class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-5 text-center text-sm text-slate-400 dark:border-slate-700 dark:text-slate-500"
				>
					<Sparkles class="mb-2 size-5" />
					More apps coming soon
				</li>
			{/if}
		</ul>

		{#if query && filtered.length === 0}
			<p class="mt-8 text-center text-sm text-slate-500">No apps match “{query}”.</p>
		{/if}
	</div>
</div>
