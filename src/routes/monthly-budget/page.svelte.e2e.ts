import { expect, test, type Page } from "@playwright/test";

const cards = (page: Page) => page.getByTestId("category-card");

test.beforeEach(async ({ page }) => {
	await page.goto("/monthly-budget");
	await page.evaluate(() => localStorage.clear());
	await page.reload();
});

test("renders default categories with targets", async ({ page }) => {
	await expect(page.getByRole("heading", { level: 1 })).toHaveText("Monthly Budget");
	await expect(page.getByTestId("income")).toHaveValue("2500");
	await expect(cards(page)).toHaveCount(4); // Needs, Wants, Savings + Duodécimos
	await expect(page.getByTestId("overview-chip")).toHaveCount(4);

	const needs = cards(page).nth(0);
	await expect(needs.getByLabel("Category name")).toHaveValue("Needs");
	await expect(needs.getByTestId("category-remaining")).toHaveText("1,250.00€ remaining");
});

test("adding expenses updates totals and focuses the new row", async ({ page }) => {
	const needs = cards(page).nth(0);
	await needs.getByRole("button", { name: "Add expense" }).click();

	const name = needs.getByPlaceholder("Expense");
	await expect(name).toBeFocused();
	await name.fill("Rent");
	await needs.getByLabel("Amount").fill("1000");

	await expect(needs.getByTestId("category-spent")).toHaveText("1,000.00€");
	await expect(needs.getByTestId("category-remaining")).toHaveText("250.00€ remaining");
	await expect(needs.getByTestId("expense-row")).toContainText("80%");
	await expect(page.getByTestId("total-tracked")).toHaveText("1,000.00€ tracked");
	await expect(page.getByTestId("total-unallocated")).toHaveText("1,500.00€ unallocated");

	await needs.getByLabel("Amount").fill("1300.5");
	await expect(needs.getByTestId("category-remaining")).toHaveText("50.50€ over budget");

	await needs.getByRole("button", { name: "Delete expense" }).click();
	await expect(needs.getByTestId("expense-row")).toHaveCount(0);
	await expect(page.getByTestId("total-tracked")).toHaveText("0.00€ tracked");
});

test("warns when percentages exceed 100%", async ({ page }) => {
	await expect(page.getByTestId("percent-warning")).toHaveCount(0);
	const pct = cards(page).nth(0).getByLabel("Category percentage");
	await pct.fill("60");
	await expect(page.getByTestId("percent-warning")).toContainText("Percentages total 110%");

	await pct.fill("250");
	await expect(pct).toHaveValue("100"); // clamped
	await pct.fill("40");
	await expect(page.getByTestId("percent-warning")).toHaveCount(0);
});

test("duodécimos card uses the duodécimos amount as target", async ({ page }) => {
	await page.getByTestId("duodecimos").fill("300");
	const duo = cards(page).nth(3);
	await expect(duo.getByLabel("Category percentage")).toHaveCount(0);
	await expect(duo.getByTestId("category-remaining")).toHaveText("300.00€ remaining");
	await expect(page.getByTestId("total-unallocated")).toHaveText("2,800.00€ unallocated");
});

test("typing decimals in income is not clobbered", async ({ page }) => {
	const income = page.getByTestId("income");
	await income.fill("");
	await income.pressSequentially("0.5");
	await expect(income).toHaveValue("0.5");
});

test("state persists across reloads", async ({ page }) => {
	await page.getByTestId("income").fill("3000");
	const wants = cards(page).nth(1);
	await wants.getByRole("button", { name: "Add expense" }).click();
	await wants.getByPlaceholder("Expense").fill("Cinema");
	await wants.getByLabel("Amount").fill("20");

	await page.reload();
	await expect(page.getByTestId("income")).toHaveValue("3000");
	await expect(cards(page).nth(1).getByPlaceholder("Expense")).toHaveValue("Cinema");
	await expect(cards(page).nth(1).getByTestId("category-spent")).toHaveText("20.00€");
});

test("export then import round-trips the budget", async ({ page }) => {
	await page.getByTestId("income").fill("1800");
	const downloadPromise = page.waitForEvent("download");
	await page.getByRole("button", { name: "Export JSON" }).click();
	const download = await downloadPromise;
	expect(download.suggestedFilename()).toBe("budget-planner.json");
	const file = await download.path();

	await page.getByTestId("income").fill("10");
	await page.getByTestId("import-input").setInputFiles(file);
	await expect(page.getByTestId("income")).toHaveValue("1800");
});

test("rejects an invalid import file", async ({ page }) => {
	const dialog = page.waitForEvent("dialog");
	await page.getByTestId("import-input").setInputFiles({
		name: "bad.json",
		mimeType: "application/json",
		buffer: Buffer.from('{"nope": true}')
	});
	const d = await dialog;
	expect(d.message()).toBe("Could not import this JSON file.");
	await d.dismiss();
	await expect(page.getByTestId("income")).toHaveValue("2500");
});

test("clear data removes stored budget and resets to defaults", async ({ page }) => {
	await page.getByTestId("income").fill("4000");
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem("offline-suite:monthly-budget")))
		.toContain("4000");

	page.once("dialog", (d) => d.dismiss());
	await page.getByRole("button", { name: "Clear data" }).click();
	await expect(page.getByTestId("income")).toHaveValue("4000"); // cancelled

	page.once("dialog", (d) => d.accept());
	await page.getByRole("button", { name: "Clear data" }).click();
	await expect(page.getByTestId("income")).toHaveValue("2500");
	expect(
		await page.evaluate(() => localStorage.getItem("offline-suite:monthly-budget"))
	).toBeNull();

	// Editing again starts saving again.
	await page.getByTestId("income").fill("2600");
	await expect
		.poll(() => page.evaluate(() => localStorage.getItem("offline-suite:monthly-budget")))
		.toContain("2600");
});

test("adds up to two extra incomes with their own cards next to duodécimos", async ({ page }) => {
	const add = page.getByTestId("add-income");
	const fields = page.getByTestId("extra-income");

	await add.click();
	await expect(fields).toHaveCount(1);
	await expect(fields.first()).toBeFocused();
	await expect(cards(page)).toHaveCount(5);
	await expect(cards(page).nth(4).getByLabel("Category name")).toHaveValue("Extra income 1");

	await add.click();
	await expect(fields).toHaveCount(2);
	await expect(add).toHaveCount(0); // limit reached

	await fields.nth(0).fill("400");
	await fields.nth(1).fill("100");
	await expect(page.getByLabel("Extra income 1", { exact: true })).toHaveValue("400");
	// 2500 income + 400 + 100, nothing tracked yet
	await expect(page.getByTestId("total-unallocated")).toHaveText("3,000.00€ unallocated");
	await expect(cards(page).nth(4).getByTestId("category-remaining")).toHaveText(
		"400.00€ remaining"
	);

	// Renaming the card renames the field label.
	await cards(page).nth(5).getByLabel("Category name").fill("Freelance");
	await expect(page.getByLabel("Freelance", { exact: true })).toHaveValue("100");

	// Survives a reload.
	await page.reload();
	await expect(fields).toHaveCount(2);

	await page.getByRole("button", { name: "Remove Extra income 1" }).click();
	await expect(fields).toHaveCount(1);
	await expect(cards(page)).toHaveCount(5);
	await expect(add).toBeVisible();
	await expect(page.getByTestId("total-unallocated")).toHaveText("2,600.00€ unallocated");

	// The freed name is reused.
	await add.click();
	await expect(cards(page).nth(5).getByLabel("Category name")).toHaveValue("Extra income 1");
});
