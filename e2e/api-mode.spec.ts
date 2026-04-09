import { expect, test } from "@playwright/test";

test.describe("api mode", () => {
  test("loads home from the live pulse endpoint even when the static artifact is unavailable", async ({
    page,
  }) => {
    await page.route("**/data/pulse.json", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "static unavailable" }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Quant Pulse/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Bitcoin ETFs see renewed inflows after three weeks of outflows/i })
    ).toBeVisible();
    await expect(page.getByText("Could not load pulse data")).not.toBeVisible();
  });

  test("loads archive from live endpoints even when static archive artifacts are unavailable", async ({
    page,
  }) => {
    await page.route("**/data/archive/index.json", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "static archive unavailable" }),
      });
    });

    await page.route("**/data/archive/current.json", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "static current unavailable" }),
      });
    });

    await page.goto("archive");

    await expect(
      page.getByRole("heading", { name: /Review archive editions and source concentration/i })
    ).toBeVisible();
    await expect(page.getByText("Selected edition: Current edition")).toBeVisible();
    await expect(page.getByText("Could not load archive data")).not.toBeVisible();
  });

  test("falls back to static pulse data when the live pulse endpoint fails", async ({ page }) => {
    await page.route("**/v1/pulse/current", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "live unavailable" }),
      });
    });

    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Quant Pulse/i })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /OpenAI launches GPT-5 with real-time reasoning capabilities/i })
    ).toBeVisible();
    await expect(page.getByText("Could not load pulse data")).not.toBeVisible();
  });

  test("falls back to static archive artifacts when live archive endpoints fail", async ({ page }) => {
    await page.route("**/v1/archive/index", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "live archive unavailable" }),
      });
    });

    await page.route("**/v1/archive/editions/**", async (route) => {
      await route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "live edition unavailable" }),
      });
    });

    await page.goto("archive");

    await expect(
      page.getByRole("heading", { name: /Review archive editions and source concentration/i })
    ).toBeVisible();
    await expect(page.getByText("Selected edition: Current edition")).toBeVisible();
    await expect(page.getByText("Could not load archive data")).not.toBeVisible();
  });
});
