import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("sidebar navigation links exist", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Overview|Orders|Products|Inventory|Analytics|Settings/i).first()).toBeVisible();
  });

  test("navigating via sidebar works", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Orders").first().click();
    await expect(page).toHaveURL(/\/orders/);
  });

  test("navigate to products", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Products").first().click();
    await expect(page).toHaveURL(/\/products/);
  });

  test("navigate to inventory", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Inventory").first().click();
    await expect(page).toHaveURL(/\/inventory/);
  });

  test("navigate to analytics", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Analytics").first().click();
    await expect(page).toHaveURL(/\/analytics/);
  });

  test("navigate to settings", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Settings").first().click();
    await expect(page).toHaveURL(/\/settings/);
  });
});
