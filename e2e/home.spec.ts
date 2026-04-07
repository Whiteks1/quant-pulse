import { expect, test } from "@playwright/test";

test.describe("home", () => {
  test("shows Quant Pulse heading", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: /Quant Pulse/i })).toBeVisible();
  });

  test("keeps home search query in the URL and filters results", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder("Search signals...").fill("openai");

    await expect(page).toHaveURL(/q=openai/);
    await expect(
      page.getByRole("heading", { name: /OpenAI launches GPT-5 with real-time reasoning capabilities/i })
    ).toBeVisible();
  });

  test("reset clears combined home filters loaded from the URL", async ({ page }) => {
    await page.goto("/?section=Crypto+%26+Markets&category=ETFs&q=bitcoin%20impossible%20query");

    await expect(page.getByText("No stories match these filters")).toBeVisible();
    await expect(page.getByText(/section: Crypto & Markets/)).toBeVisible();
    await expect(page.getByText(/category: ETFs/)).toBeVisible();
    await expect(page.getByText(/query: "bitcoin impossible query"/)).toBeVisible();

    await page.getByRole("button", { name: /Reset Filters/i }).click();

    await expect(page).toHaveURL(/\/(?:\?|$)/);
    await expect(page).not.toHaveURL(/section=/);
    await expect(page).not.toHaveURL(/category=/);
    await expect(page).not.toHaveURL(/q=/);
    await expect(page.getByText("No stories match these filters")).not.toBeVisible();
    await expect(page.getByPlaceholder("Search signals...")).toHaveValue("");
  });
});
