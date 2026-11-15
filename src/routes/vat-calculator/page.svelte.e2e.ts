import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
	await page.goto("/vat-calculator");
});

const calc = (page: Page) => page.getByTestId("vat-calculator");
const cart = (page: Page) => page.getByTestId("mini-cart");

test.describe("calculator", () => {
	test("computes price with VAT from price without VAT", async ({ page }) => {
		await expect(page.getByTestId("calc-vat")).toHaveValue("23");
		await page.getByTestId("calc-net").fill("100");
		await calc(page).getByRole("button", { name: "Calculate" }).click();
		await expect(page.getByTestId("calc-gross")).toHaveValue("123");
		await expect(page.getByTestId("calc-amount")).toHaveValue("€23.00");
	});

	test("computes price without VAT from price with VAT", async ({ page }) => {
		await page.getByTestId("calc-vat").fill("6");
		await page.getByTestId("calc-gross").fill("10.60");
		await page.getByTestId("calc-gross").press("Enter");
		await expect(page.getByTestId("calc-net")).toHaveValue("10");
		await expect(page.getByTestId("calc-amount")).toHaveValue("€0.60");
	});

	test("empty VAT falls back to 23%", async ({ page }) => {
		await page.getByTestId("calc-vat").fill("");
		await page.getByTestId("calc-net").fill("50");
		await calc(page).getByRole("button", { name: "Calculate" }).click();
		await expect(page.getByTestId("calc-vat")).toHaveValue("23");
		await expect(page.getByTestId("calc-gross")).toHaveValue("61.5");
	});

	test("last edited price wins when both are filled", async ({ page }) => {
		await page.getByTestId("calc-net").fill("100");
		await calc(page).getByRole("button", { name: "Calculate" }).click();
		await page.getByTestId("calc-gross").fill("246");
		await calc(page).getByRole("button", { name: "Calculate" }).click();
		await expect(page.getByTestId("calc-net")).toHaveValue("200");
		await expect(page.getByTestId("calc-amount")).toHaveValue("€46.00");
	});

	test("shows an error without any price", async ({ page }) => {
		await calc(page).getByRole("button", { name: "Calculate" }).click();
		await expect(calc(page).getByRole("alert")).toHaveText(
			"Fill in a price with or without VAT."
		);
	});
});

test.describe("mini cart", () => {
	test("computes valid rows, highlights invalid ones and totals", async ({ page }) => {
		const rows = cart(page).getByTestId("cart-row");
		await expect(rows).toHaveCount(1);

		await rows.nth(0).getByLabel("Name").fill("Book");
		await rows.nth(0).getByLabel("VAT percentage").fill("6");
		await rows.nth(0).getByLabel("Price with VAT").fill("21.20");

		await cart(page).getByRole("button", { name: "Add item" }).click();
		await expect(rows.nth(1).getByLabel("Name")).toBeFocused();
		await rows.nth(1).getByLabel("Name").fill("Laptop");
		await rows.nth(1).getByLabel("Price without VAT").fill("1000");

		await cart(page).getByRole("button", { name: "Add item" }).click();
		await rows.nth(2).getByLabel("Name").fill("No price");

		await cart(page).getByRole("button", { name: "Calculate" }).click();

		await expect(rows.nth(0)).toHaveAttribute("data-status", "valid");
		await expect(rows.nth(0).getByLabel("Price without VAT")).toHaveValue("20");
		await expect(rows.nth(0).getByTestId("row-amount")).toHaveText("€1.20");
		await expect(rows.nth(1).getByLabel("Price with VAT")).toHaveValue("1230");
		await expect(rows.nth(2)).toHaveAttribute("data-status", "invalid");
		await expect(page.getByTestId("cart-invalid")).toContainText("1 row was skipped");

		await expect(page.getByTestId("total-gross")).toHaveText("€1,251.20");
		await expect(page.getByTestId("total-net")).toHaveText("€1,020.00");
		await expect(page.getByTestId("total-amount")).toHaveText("€231.20");
		await expect(page.getByTestId("cart-totals")).not.toContainText("%");
		await expect(page.getByTestId("cart-head").locator("span").nth(1)).toHaveText("VAT (%)");

		// Editing marks totals as stale and clears the highlight on that row.
		await rows.nth(2).getByLabel("Price with VAT").fill("12.30");
		await expect(rows.nth(2)).toHaveAttribute("data-status", "pending");
		await expect(page.getByTestId("cart-stale")).toBeVisible();

		await cart(page).getByRole("button", { name: "Calculate" }).click();
		await expect(page.getByTestId("cart-invalid")).toHaveCount(0);
		await expect(page.getByTestId("total-gross")).toHaveText("€1,263.50");

		await rows.nth(1).getByRole("button", { name: "Remove item" }).click();
		await expect(rows).toHaveCount(2);
	});
});

test("mini cart fits a phone screen and labels each field", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	const row = cart(page).getByTestId("cart-row").first();
	await expect(page.getByTestId("cart-head")).toBeHidden();
	await expect(row.getByText("VAT %")).toBeVisible();
	await expect(row.getByText("With VAT €")).toBeVisible();
	const box = (await cart(page).boundingBox())!;
	expect(box.x + box.width).toBeLessThanOrEqual(390);
});
