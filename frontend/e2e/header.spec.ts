import { test, expect } from "@playwright/test";

test.describe("Header", () => {
  test("header shows theme toggle", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByLabel(/toggle theme/i).first()).toBeVisible();
  });

  test("header shows navigation branding", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(/Gateway/i).first()).toBeVisible();
  });
});
