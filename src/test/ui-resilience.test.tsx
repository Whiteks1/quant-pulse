import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ExecutiveBrief } from "@/components/ExecutiveBrief";
import { FeaturedStories } from "@/components/FeaturedStories";
import { NewsCard } from "@/components/NewsCard";
import { WhatToWatch } from "@/components/WhatToWatch";

const baseNewsItem = {
  id: "item-1",
  title: "OpenAI ships a new model",
  source: "OpenAI",
  sourceTier: "primary",
  url: "https://openai.com/",
  linkType: "source-home",
  publishedAt: "2026-04-06T08:00:00Z",
  category: "AI",
  section: "Technology",
  summary: "A short summary.",
  whyItMatters: "A short reason.",
  impact: "A short impact.",
  tags: ["OpenAI", "AI"],
  signalVsNoise: "signal",
  priority: "P1",
  relevanceScore: 80,
  scoreJustification: {
    recency: 10,
    marketImpact: 20,
    structuralImpact: 20,
    sourceQuality: 15,
    crossValidation: 5,
    thematicRelevance: 10,
    rationale: "Valid rationale.",
  },
  dedupeKey: "openai-model",
} as const;

describe("UI resilience", () => {
  it("does not render decorative sections when their content is empty", () => {
    const { container } = render(
      <MemoryRouter>
        <ExecutiveBrief points={[]} />
        <FeaturedStories items={[]} />
        <WhatToWatch items={[]} />
      </MemoryRouter>
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("hides a broken image in NewsCard while keeping the story visible", () => {
    render(
      <MemoryRouter>
        <NewsCard
          item={{
            ...baseNewsItem,
            imageUrl: "images/editorial/missing.svg",
            imageAlt: "Broken image",
          }}
        />
      </MemoryRouter>
    );

    const image = screen.getByAltText("Broken image");
    fireEvent.error(image);

    expect(screen.queryByAltText("Broken image")).not.toBeInTheDocument();
    expect(screen.getByText("OpenAI ships a new model")).toBeInTheDocument();
  });
});
