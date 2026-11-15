<script lang="ts">
	import { resolve } from "$app/paths";
	import { page } from "$app/state";
	import { ArrowUpRight, GitFork } from "@lucide/svelte";
	import { apps } from "#lib/apps.js";
	import BrandLogo from "./BrandLogo.svelte";

	const REPO_URL = "https://github.com/miguelmagueijo/offline-suite";
</script>

<footer
	class="border-t border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-900/40"
	data-testid="site-footer"
>
	<div
		class="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 md:flex-row md:items-start md:justify-between"
	>
		<a
			href={resolve("/")}
			class="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight"
		>
			<BrandLogo class="size-7" />
			oSuite
		</a>

		<nav aria-label="Apps">
			<h2
				class="mb-2 text-[11px] font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400"
			>
				Apps
			</h2>
			<ul class="flex flex-col gap-1.5">
				{#each apps as app (app.href)}
					{@const Icon = app.icon}
					{@const current = page.url.pathname === app.href}
					<li>
						<a
							href={resolve(app.href)}
							aria-current={current ? "page" : undefined}
							class="inline-flex items-center gap-2 text-sm transition hover:text-violet-600 dark:hover:text-violet-400 {current
								? 'font-semibold text-slate-900 dark:text-slate-100'
								: 'text-slate-600 dark:text-slate-400'}"
						>
							<Icon class="size-4" />
							{app.name}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- external link -->
		<a
			href={REPO_URL}
			target="_blank"
			rel="noopener noreferrer"
			class="group inline-flex items-center gap-2 self-start rounded-md border border-slate-300 px-3 py-2 text-sm transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
		>
			<GitFork class="size-4" />
			Host it or improve it yourself!
			<ArrowUpRight
				class="size-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
			/>
		</a>
	</div>
</footer>
