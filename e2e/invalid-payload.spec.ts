import { expect, test } from "@playwright/test";

test.describe("invalid published payloads", () => {
  test("shows the home error state when pulse.json has an invalid critical shape", async ({ page }) => {
    await page.route("**/data/pulse.json", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          version: 2,
          updatedAt: "2026-04-05T00:10:00Z",
          executiveBrief: [],
          watchItems: [],
        }),
      });
    });

    await page.goto("/");

    await expect(page.getByText("Could not load pulse data")).toBeVisible();
    await expect(page.getByText(/Invalid pulse\.json: payload\.items must be an array/i)).toBeVisible();
  });

  test("shows the archive error state when archive index shape is invalid", async ({ page }) => {
    await page.route("**/data/archive/index.json", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          generatedAt: "2026-04-05T00:10:00Z",
          currentEditionSlug: "current",
          editions: [],
        }),
      });
    });

    await page.goto("archive");

    await expect(page.getByText("Could not load archive data")).toBeVisible();
    await expect(
      page.getByText(/Invalid archive index: payload\.editions must contain at least one edition/i)
    ).toBeVisible();
  });

  test("shows the archive error state when the selected archive edition has an invalid shape", async ({
    page,
  }) => {
    await page.route("**/data/archive/current.json", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          version: 2,
          updatedAt: "2026-04-05T00:10:00Z",
          items: [],
          executiveBrief: [],
        }),
      });
    });

    await page.goto("archive");

    await expect(page.getByText("Could not load archive data")).toBeVisible();
    await expect(
      page.getByText(/Invalid archive edition \(data\/archive\/current\.json\): payload\.watchItems must be an array/i)
    ).toBeVisible();
  });
});
