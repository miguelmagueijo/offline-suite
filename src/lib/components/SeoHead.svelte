<script lang="ts">
	import { page } from "$app/state";
	import { OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, absoluteUrl } from "#lib/seo.js";

	interface Props {
		/** Page name; omitted on the home page, which uses the site tagline. */
		title?: string;
		description?: string;
		/** Path of this page, used for the canonical and og:url. */
		path: string;
	}

	let { title, description = SITE_DESCRIPTION, path }: Props = $props();

	const fullTitle = $derived(title ? `${title} · ${SITE_NAME}` : `${SITE_NAME}: ${SITE_TAGLINE}`);
	const url = $derived(absoluteUrl(page.url.origin, path));
	const image = $derived(absoluteUrl(page.url.origin, OG_IMAGE.path));
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={SITE_NAME} />
	<meta property="og:locale" content="en" />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:image" content={image} />
	<meta property="og:image:type" content="image/png" />
	<meta property="og:image:width" content={String(OG_IMAGE.width)} />
	<meta property="og:image:height" content={String(OG_IMAGE.height)} />
	<meta property="og:image:alt" content={OG_IMAGE.alt} />

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={image} />
	<meta name="twitter:image:alt" content={OG_IMAGE.alt} />
</svelte:head>
