import { test, expect } from "@playwright/test";

test.describe("Orders", () => {
  test("orders page loads with table", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByText(/Orders/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /new order/i })).toBeVisible();
  });

  test("orders search filters results", async ({ page }) => {
    await page.goto("/orders");
    const search = page.getByPlaceholder(/search order/i);
    await search.fill("EAG-10240");
    await expect(page.getByText("EAG-10240")).toBeVisible();
  });

  test("orders status filter buttons exist", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByText("pending")).toBeVisible();
    await expect(page.getByText("delivered")).toBeVisible();
  });

  test("new order dialog opens", async ({ page }) => {
    await page.goto("/orders");
    await page.getByRole("button", { name: /new order/i }).click();
    await expect(page.getByText(/customer name/i)).toBeVisible();
    await expect(page.getByText(/create order/i)).toBeVisible();
  });

  test("new order dialog can be cancelled", async ({ page }) => {
    await page.goto("/orders");
    await page.getByRole("button", { name: /new order/i }).click();
    await page.getByText("Cancel").click();
    await expect(page.getByText(/customer name/i)).not.toBeVisible();
  });

  test("orders page shows total count", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByText(/of/)).toBeVisible();
  });

  test("orders page shows search and filter area", async ({ page }) => {
    await page.goto("/orders");
    await expect(page.getByPlaceholder(/search order/i)).toBeVisible();
  });
});
