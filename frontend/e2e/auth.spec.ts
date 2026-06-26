import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("login page renders brand and form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Enterprise Gateway")).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("shows error on invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("wrong@test.com");
    await page.getByLabel(/password/i).fill("wrong");
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByText(/invalid|error/i).first()).toBeVisible();
  });
});
