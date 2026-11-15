import { apps } from "#lib/apps.js";
import { absoluteUrl } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = ({ url }) => {
	const urls = ["/", ...apps.map((app) => app.href)]
		.map((path) => `\t<url><loc>${absoluteUrl(url.origin, path)}</loc></url>`)
		.join("\n");

	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { "Content-Type": "application/xml" } }
	);
};
