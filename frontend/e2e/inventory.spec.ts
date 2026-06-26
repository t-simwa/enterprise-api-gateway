import { test, expect } from "@playwright/test";

test.describe("Inventory", () => {
  test("inventory page loads", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByText(/Inventory/i)).toBeVisible();
  });

  test("inventory shows table with SKU column", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByText(/SKU/i).first()).toBeVisible();
  });

  test("inventory shows warehouse column", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByText(/Warehouse/i).first()).toBeVisible();
  });

  test("inventory shows quantity column", async ({ page }) => {
    await page.goto("/inventory");
    await expect(page.getByText(/Qty/i).first()).toBeVisible();
  });
});
