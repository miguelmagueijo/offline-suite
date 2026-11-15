import { absoluteUrl } from "#lib/seo.js";
import type { RequestHandler } from "./$types";

// Search engines may index the site; AI-training tokens and every other crawler are denied.
const RULES = `# Search engines may index the site.
User-agent: Googlebot
User-agent: Bingbot
User-agent: DuckDuckBot
User-agent: Slurp
User-agent: Applebot
User-agent: YandexBot
User-agent: Baiduspider
Allow: /

# Opt out of AI training even for search engines that offer a separate token.
User-agent: Google-Extended
User-agent: Applebot-Extended
Disallow: /

# Everything else (AI crawlers, scrapers, SEO bots) is denied.
User-agent: *
Disallow: /
`;

// A route rather than a static file so the sitemap URL follows ORIGIN.
export const GET: RequestHandler = ({ url }) =>
	new Response(`${RULES}\nSitemap: ${absoluteUrl(url.origin, "/sitemap.xml")}\n`, {
		headers: { "Content-Type": "text/plain; charset=utf-8" }
	});
