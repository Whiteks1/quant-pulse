import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("shows Quant Pulse heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Quant Pulse/i })).toBeVisible();
  });
});
