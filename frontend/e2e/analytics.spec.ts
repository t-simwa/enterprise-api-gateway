import { test, expect } from "@playwright/test";

test.describe("Analytics", () => {
  test("analytics page loads", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText(/Analytics|Revenue/i)).toBeVisible();
  });

  test("analytics shows revenue chart", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText(/revenue/i).first()).toBeVisible();
  });
});
