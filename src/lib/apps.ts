import type { Component } from "svelte";
import { PiggyBank } from "@lucide/svelte";
import type { RouteId } from "$app/types";

/**
 * Registry of the "apps" shown on the portal home page.
 * Each app is an independent route; only the portal knows about this list.
 * To add an app: create its route folder and add an entry here.
 */
export interface AppEntry {
	href: RouteId;
	name: string;
	description: string;
	icon: Component<{ class?: string }>;
	/** Full Tailwind classes for the icon tile (must be literal so Tailwind picks them up). */
	accent: string;
	tags?: string[];
}

export const apps: AppEntry[] = [
	{
		href: "/monthly-budget",
		name: "Monthly Budget",
		description: "Split your income into categories and track where every euro goes.",
		icon: PiggyBank,
		accent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
		tags: ["Finance"]
	}
];
