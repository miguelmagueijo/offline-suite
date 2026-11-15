<script lang="ts">
	import { asset } from "$app/paths";

	interface Props {
		/** Tailwind size classes for the mark, e.g. "size-7". */
		class?: string;
	}

	let { class: className = "size-7" }: Props = $props();
</script>

<!-- Ink mark on light backgrounds, paper mark on dark ones; follows the site theme, not the OS. -->
<img src={asset("logo.png")} alt="" class="{className} shrink-0 dark:hidden" />
<img src={asset("logo_light.png")} alt="" class="{className} hidden shrink-0 dark:block" />
