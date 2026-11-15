import { expect, test } from "@playwright/test";

test("portal lists apps and links to them", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("oSuite");

	const card = page.getByRole("main").getByRole("link", { name: /Monthly Budget/ });
	await expect(card).toBeVisible();

	await page.getByPlaceholder("Search apps…").fill("nothing-matches");
	await expect(card).toBeHidden();
	await page.getByPlaceholder("Search apps…").fill("budget");
	await expect(card).toBeVisible();

	await card.click();
	await expect(page).toHaveURL(/\/monthly-budget$/);
});

test("theme toggle cycles and persists", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/");
	const toggle = page.getByTestId("theme-toggle");
	await expect(toggle).toHaveText("Auto");
	await expect(page.locator("html")).not.toHaveClass(/dark/);

	await toggle.click(); // light
	await toggle.click(); // dark
	await expect(toggle).toHaveText("Dark");
	await expect(page.locator("html")).toHaveClass(/dark/);

	await page.reload();
	await expect(page.locator("html")).toHaveClass(/dark/);
	await expect(page.getByTestId("theme-toggle")).toHaveText("Dark");
});

test("footer links to apps and the repo, and sits at the bottom", async ({ page }) => {
	await page.setViewportSize({ width: 1280, height: 1600 });
	await page.goto("/");
	const footer = page.getByTestId("site-footer");
	await expect(
		footer.getByRole("link", { name: /host it or improve it yourself/i })
	).toHaveAttribute("href", "https://github.com/miguelmagueijo/offline-suite");
	const box = await footer.boundingBox();
	expect(Math.round(box!.y + box!.height)).toBe(1600);

	await footer.getByRole("link", { name: "Monthly Budget" }).click();
	await expect(page).toHaveURL(/\/monthly-budget$/);
	await expect(footer.getByRole("link", { name: "Monthly Budget" })).toHaveAttribute(
		"aria-current",
		"page"
	);
});

test("link-preview tags, sitemap and robots use the serving origin", async ({
	page,
	request,
	baseURL
}) => {
	const site = new URL(baseURL ?? "http://localhost:4173").origin;
	for (const [path, title] of [
		["/", /^oSuite: /],
		["/monthly-budget", "Monthly Budget · oSuite"],
		["/vat-calculator", "VAT Calculator · oSuite"]
	] as const) {
		await page.goto(path);
		await expect(page).toHaveTitle(title);
		const meta = (sel: string) => page.locator(sel).getAttribute("content");
		expect(await meta('meta[name="description"]')).toBeTruthy();
		expect(await meta('meta[property="og:url"]')).toBe(site + path);
		expect(await meta('meta[property="og:image"]')).toBe(`${site}/og-image.png`);
		expect(await meta('meta[name="twitter:card"]')).toBe("summary_large_image");
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", site + path);
		await expect(page.locator('meta[name="description"]')).toHaveCount(1);
	}

	expect((await request.get("/og-image.png")).ok()).toBe(true);
	const sitemap = await (await request.get("/sitemap.xml")).text();
	expect(sitemap).toContain(`<loc>${site}/vat-calculator</loc>`);
	const robots = await (await request.get("/robots.txt")).text();
	expect(robots).toContain("User-agent: Googlebot");
	expect(robots).toContain(`Sitemap: ${site}/sitemap.xml`);
});

test("footer discloses AI use", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByTestId("ai-disclaimer")).toContainText("AI tools were used");
});
