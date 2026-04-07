import fs from "node:fs";
import path from "node:path";
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

type ArchiveIndex = {
  generatedAt: string;
  currentEditionSlug: string;
  editions: Array<{
    slug: string;
    label: string;
    updatedAt: string;
    version: number;
    path: string;
    isCurrent: boolean;
    totalItems: number;
    signalCount: number;
    p1Count: number;
  }>;
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(process.cwd(), relativePath), "utf8")) as T;
}

function buildEditionSummary(
  bundle: PulseBundle,
  slug: string,
  label: string,
  pathValue: string,
  isCurrent: boolean
) {
  return {
    slug,
    label,
    updatedAt: bundle.updatedAt,
    version: bundle.version,
    path: pathValue,
    isCurrent,
    totalItems: bundle.items.length,
    signalCount: bundle.items.filter((item) => item.signalVsNoise === "signal").length,
    p1Count: bundle.items.filter((item) => item.priority === "P1").length,
  };
}

test.describe("archive", () => {
  const currentBundle = readJson<PulseBundle>("public/data/archive/current.json");
  const uniqueSourceEntry =
    (() => {
      const counts = new Map<string, number>();
      for (const item of currentBundle.items) {
        counts.set(item.source, (counts.get(item.source) ?? 0) + 1);
      }

      return currentBundle.items.find((item) => counts.get(item.source) === 1) ?? currentBundle.items[0];
    })();

  test("navigates from home to archive and applies source filters", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "Browse Archive" }).click();

    await expect(page).toHaveURL(/\/archive(?:\?|$)/);
    await expect(
      page.getByRole("heading", { name: /Review archive editions and source concentration/i })
    ).toBeVisible();

    await page.getByRole("button", { name: new RegExp(uniqueSourceEntry.source, "i") }).click();

    await expect(page).toHaveURL(new RegExp(`source=${encodeURIComponent(uniqueSourceEntry.source)}`));
    await expect(page.getByText(uniqueSourceEntry.title)).toBeVisible();
  });

  test("shows archive comparison intelligence when a previous published edition exists", async ({ page }) => {
    const previousBundle: PulseBundle = {
      ...currentBundle,
      version: currentBundle.version - 1,
      updatedAt: "2026-04-04T00:10:00Z",
      items: currentBundle.items.slice(0, currentBundle.items.length - 2),
      executiveBrief: currentBundle.executiveBrief.slice(0, Math.max(1, currentBundle.executiveBrief.length - 1)),
      watchItems: currentBundle.watchItems.slice(0, Math.max(1, currentBundle.watchItems.length - 1)),
    };

    const archiveIndex: ArchiveIndex = {
      generatedAt: currentBundle.updatedAt,
      currentEditionSlug: "current",
      editions: [
        buildEditionSummary(currentBundle, "current", "Current edition", "data/archive/current.json", true),
        buildEditionSummary(previousBundle, "previous", "Previous edition", "data/archive/editions/previous.json", false),
      ],
    };

    await page.route("**/data/archive/index.json", async (route) => {
      await route.fulfill({ json: archiveIndex });
    });

    await page.route("**/data/archive/editions/previous.json", async (route) => {
      await route.fulfill({ json: previousBundle });
    });

    await page.goto("archive");

    await expect(page.getByText("Archive Intelligence")).toBeVisible();
    await expect(page.getByRole("heading", { name: /What changed versus Previous edition/i })).toBeVisible();
    await expect(page.getByText("Stories tracked")).toBeVisible();
    await expect(page.getByText("Section mix")).toBeVisible();
  });
});
