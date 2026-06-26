import { test, expect } from "@playwright/test";

test.describe("Settings", () => {
  test("settings page loads", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/Setting/i)).toBeVisible();
  });

  test("settings shows API base URL info", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/API|mock|proxy/i).first()).toBeVisible();
  });

  test("settings shows user role", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(/admin|manager|role/i).first()).toBeVisible();
  });
});
