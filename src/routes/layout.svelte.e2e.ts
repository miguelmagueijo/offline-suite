import { expect, test, type Page } from "@playwright/test";

/** Horizontal edges of the navbar content vs. the page's main content. */
async function edges(page: Page) {
	return page.evaluate(() => {
		const nav = document.querySelector("header > div")!.getBoundingClientRect();
		const main = document.querySelector("main > *:not(script)")!.getBoundingClientRect();
		return {
			nav: [Math.round(nav.left), Math.round(nav.right)],
			main: [Math.round(main.left), Math.round(main.right)]
		};
	});
}

for (const width of [390, 1024, 1600]) {
	test.describe(`at ${width}px`, () => {
		test.use({ viewport: { width, height: 900 } });

		for (const path of ["/", "/monthly-budget", "/vat-calculator"]) {
			test(`${path} content aligns with the navbar`, async ({ page }) => {
				await page.goto(path);
				const { nav, main } = await edges(page);
				// The navbar's inner box includes its px-4 padding; the main content box doesn't.
				expect(main[0]).toBe(nav[0] + 16);
				expect(main[1]).toBe(nav[1] - 16);
				// Nothing pushes the page wider than the screen.
				expect(
					await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
				).toBe(true);
			});
		}

		test("budget width doesn't change when expenses are added", async ({ page }) => {
			await page.goto("/monthly-budget");
			const before = await edges(page);
			await page
				.getByTestId("category-card")
				.first()
				.getByRole("button", { name: "Add expense" })
				.click();
			await expect(page.getByTestId("expense-row")).toHaveCount(1);
			expect(await edges(page)).toEqual(before);
		});
	});
}
