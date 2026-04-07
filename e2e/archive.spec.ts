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

    await expect(page.getByText("Archive continuity")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Follow the published sequence/i })).toBeVisible();
    await expect(page.getByText("Edition 2 of 2")).toBeVisible();
    await expect(page.getByRole("button", { name: /Older snapshot/i })).toBeVisible();
    await expect(page.getByText("Baseline 2026-04-05 · v2")).toBeVisible();
    await expect(page.getByText("Archive Intelligence")).toBeVisible();
    await expect(page.getByRole("heading", { name: /What changed versus/i })).toBeVisible();
    await expect(page.getByText("Stories tracked")).toBeVisible();
    await expect(page.getByText("Change highlights")).toBeVisible();
    await expect(
      page.getByText("No story-level deltas detected between these published editions yet.")
    ).toBeVisible();
    await expect(page.getByText("Section mix")).toBeVisible();
  });

  test("surfaces story-level change highlights when archive editions diverge", async ({ page }) => {
    await page.route("**/data/archive/editions/2026-04-05_v2.json", async (route) => {
      const response = await route.fetch();
      const payload = (await response.json()) as PulseBundle;
      const removedItemId = "2026-04-04_btc-etf-inflows_bloomberg";
      const modifiedItems = payload.items
        .filter((item) => item.id !== removedItemId)
        .map((item) =>
          item.id === "2026-04-04_ethereum-pectra_ef"
            ? { ...item, priority: "P3" as const }
            : item
        );

      await route.fulfill({
        response,
        json: {
          ...payload,
          items: modifiedItems,
          executiveBrief: payload.executiveBrief.filter((entry) => entry.itemId !== removedItemId),
        },
      });
    });

    await page.goto("archive");

    await expect(page.getByText("Change highlights")).toBeVisible();
    await expect(page.getByText("New P1 story")).toBeVisible();
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "New P1 story" })
        .getByRole("heading", { name: /Bitcoin ETFs see renewed inflows/i })
    ).toBeVisible();
    await expect(page.getByText("Priority raised to P2")).toBeVisible();
    await expect(
      page
        .getByRole("article")
        .filter({ hasText: "Priority raised to P2" })
        .getByRole("heading", { name: /Ethereum completes Pectra upgrade/i })
    ).toBeVisible();
  });

  test("navigates the archive continuity sequence with older and newer snapshot controls", async ({ page }) => {
    await page.goto("archive");

    await page.getByRole("button", { name: /Older snapshot/i }).click();

    await expect(page).toHaveURL(/edition=2026-04-05_v2/);
    await expect(page.getByText("Loading archive…")).not.toBeVisible();
    await expect(page.getByText("Selected edition: 2026-04-05 · v2")).toBeVisible();
    await expect(page.getByText("Edition 1 of 2")).toBeVisible();
    await expect(page.getByRole("button", { name: /Newer snapshot/i })).toBeVisible();

    await page.getByRole("button", { name: /Newer snapshot/i }).click();

    await expect(page).toHaveURL(/\/archive(?:\?|$)/);
    await expect(page.getByText("Loading archive…")).not.toBeVisible();
    await expect(page.getByText("Edition 2 of 2")).toBeVisible();
    await expect(page.getByText("Selected edition: Current edition")).toBeVisible();
  });

  test("reset all clears archive filters while preserving the selected edition", async ({ page }) => {
    await page.goto(
      "archive?edition=2026-04-05_v2&section=Crypto+%26+Markets&category=ETFs&q=bitcoin&source=Bloomberg"
    );

    await expect(page).toHaveURL(/edition=2026-04-05_v2/);
    await expect(page).toHaveURL(/section=Crypto\+%26\+Markets/);
    await expect(page).toHaveURL(/category=ETFs/);
    await expect(page).toHaveURL(/q=bitcoin/);
    await expect(page).toHaveURL(/source=Bloomberg/);
    await expect(
      page.getByRole("heading", { name: /Bitcoin ETFs see renewed inflows after three weeks of outflows/i })
    ).toBeVisible();

    await page.getByRole("button", { name: /Reset all filters/i }).click();

    await expect(page).toHaveURL(/edition=2026-04-05_v2/);
    await expect(page).not.toHaveURL(/section=/);
    await expect(page).not.toHaveURL(/category=/);
    await expect(page).not.toHaveURL(/q=/);
    await expect(page).not.toHaveURL(/source=/);
    await expect(page.getByPlaceholder("Search signals...")).toHaveValue("");
    await expect(page.getByText("Selected edition: 2026-04-05 · v2")).toBeVisible();
  });

  test("clear archive facets preserves section and query while removing date and source", async ({ page }) => {
    await page.goto("archive?section=Technology&q=openai&source=OpenAI&date=2026-04-04");

    await expect(page).toHaveURL(/section=Technology/);
    await expect(page).toHaveURL(/q=openai/);
    await expect(page).toHaveURL(/source=OpenAI/);
    await expect(page).toHaveURL(/date=2026-04-04/);

    await page.getByRole("button", { name: /Clear archive facets/i }).click();

    await expect(page).toHaveURL(/section=Technology/);
    await expect(page).toHaveURL(/q=openai/);
    await expect(page).not.toHaveURL(/source=/);
    await expect(page).not.toHaveURL(/date=/);
    await expect(
      page.getByRole("heading", { name: /OpenAI launches GPT-5 with real-time reasoning capabilities/i })
    ).toBeVisible();
  });
});
