import { test, expect } from "@playwright/test";

test.describe("Products", () => {
  test("product list loads", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText(/sku|name|price/i).first()).toBeVisible();
  });
});
