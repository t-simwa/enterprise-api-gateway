import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test("dashboard loads KPIs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/total revenue|orders|processing|low stock/i).first()).toBeVisible();
  });
});
