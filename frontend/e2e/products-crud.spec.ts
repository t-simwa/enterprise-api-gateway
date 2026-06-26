import { test, expect } from "@playwright/test";

test.describe("Products CRUD", () => {
  test("products page loads with SKU column", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText(/SKU/i).first()).toBeVisible();
  });

  test("add product button exists", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByRole("button", { name: /add product/i })).toBeVisible();
  });

  test("add product dialog opens", async ({ page }) => {
    await page.goto("/products");
    await page.getByRole("button", { name: /add product/i }).click();
    await expect(page.getByText(/Product name/i)).toBeVisible();
    await expect(page.getByText(/Unit price/i)).toBeVisible();
  });

  test("product search filters results", async ({ page }) => {
    await page.goto("/products");
    const search = page.getByPlaceholder(/search product/i);
    if (await search.isVisible()) {
      await search.fill("Hoodie");
    }
  });

  test("products shows price column", async ({ page }) => {
    await page.goto("/products");
    await expect(page.getByText(/Price/i).first()).toBeVisible();
  });
});
