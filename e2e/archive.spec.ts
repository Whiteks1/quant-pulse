import { expect, test } from "@playwright/test";

type PulseBundle = {
  version: number;
  updatedAt: string;
  items: Array<{
    title: string;
    source: string;
    signalVsNoise: "signal" | "noise";
    priority: "P1" | "P2" | "P3";
  }>;
  executiveBrief: Array<{ id: string; itemId: string; text: string }>;
  watchItems: Array<{ id: string; title: string; source: string }>;
};

test.describe("archive", () => {
  test("navigates from home to archive and applies source filters", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Browse Archive" }).click();

    await expect(page).toHaveURL(/\/archive(?:\?|$)/);
    await expect(
      page.getByRole("heading", { name: /Review archive editions and source concentration/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /Bloomberg/i }).click();

    await expect(page).toHaveURL(/source=Bloomberg/);
    await expect(page.getByText("Bitcoin ETFs see renewed inflows after three weeks of outflows")).toBeVisible();
  });

  test("shows archive comparison intelligence when a published historical edition exists", async ({ page }) => {
    await page.goto("archive");

    await expect(page.getByText("Archive Intelligence")).toBeVisible();
    await expect(page.getByRole("heading", { name: /What changed versus/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /2026-04-05 · v2/i })).toBeVisible();
    await expect(page.getByText("Stories tracked")).toBeVisible();
    await expect(page.getByText("Section mix")).toBeVisible();
  });
});
