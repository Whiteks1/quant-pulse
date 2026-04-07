import { expect, test } from "@playwright/test";

test.describe("degraded loading", () => {
  test("shows the home error state when pulse.json cannot be loaded", async ({ page }) => {
    await page.route("**/data/pulse.json", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "service unavailable" }),
      });
    });

    await page.goto("/");

    await expect(page.getByText("Could not load pulse data")).toBeVisible();
    await expect(page.getByText(/503 Service Unavailable/i)).toBeVisible();
  });

  test("shows the archive error state when the archive index cannot be loaded", async ({ page }) => {
    await page.route("**/data/archive/index.json", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "archive unavailable" }),
      });
    });

    await page.goto("archive");

    await expect(page.getByText("Could not load archive data")).toBeVisible();
    await expect(page.getByText(/500 Internal Server Error/i)).toBeVisible();
  });

  test("shows the archive error state when the selected archive edition fails to load", async ({ page }) => {
    await page.route("**/data/archive/current.json", async (route) => {
      await route.fulfill({
        status: 502,
        contentType: "application/json",
        body: JSON.stringify({ error: "bad gateway" }),
      });
    });

    await page.goto("archive");

    await expect(page.getByText("Could not load archive data")).toBeVisible();
    await expect(page.getByText(/502 Bad Gateway/i)).toBeVisible();
  });
});
