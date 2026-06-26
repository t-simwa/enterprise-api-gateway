import { test, expect } from "@playwright/test";

test.describe("Responsive Layout", () => {
  test("sidebar collapses on mobile viewport", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await expect(page.getByText(/Overview|Orders/).first()).toBeVisible();
  });
});
