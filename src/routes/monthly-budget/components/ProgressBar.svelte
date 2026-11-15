<script lang="ts">
	interface Props {
		/** 0–100 */
		value: number;
		/** CSS color; falls back to the default blue when omitted. */
		color?: string;
		testid?: string;
	}

	let { value, color, testid }: Props = $props();
</script>

<div
	class="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
	role="progressbar"
	aria-valuemin={0}
	aria-valuemax={100}
	aria-valuenow={Math.round(value)}
>
	<div
		class="h-full rounded-full transition-all {color ? '' : 'bg-blue-600 dark:bg-blue-500'}"
		style:width="{Math.min(Math.max(value, 0), 100)}%"
		style:background={color}
		data-testid={testid}
	></div>
</div>
