export const SITE_NAME = "oSuite";

export const SITE_TAGLINE = "Private tools for organising your life";

export const SITE_DESCRIPTION =
	"Small, open-source tools for personal organisation, like a monthly budget and a VAT calculator. Everything runs in your browser and no data is ever sent to a server. Use it here or host it yourself.";

/** 1200×630 preview image used by social networks and chat apps. */
export const OG_IMAGE = {
	path: "/og-image.png",
	width: 1200,
	height: 630,
	alt: "oSuite: private, open-source tools that run entirely in your browser"
};

/**
 * Absolute URL for a path on this deployment. `origin` comes from the request URL, which
 * adapter-node builds from the ORIGIN env var, so every self-hosted copy points at itself.
 */
export const absoluteUrl = (origin: string, path: string) => new URL(path, origin).href;
