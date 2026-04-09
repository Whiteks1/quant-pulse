const HOUR_IN_MS = 60 * 60 * 1000;
const technologyCoreCategories = new Set(["AI", "Cybersecurity", "Cloud", "Chips", "Infrastructure"]);
const cryptoCoreCategories = new Set(["BTC", "ETH", "ETFs", "Regulation", "Security", "Market Structure", "Custody"]);
const macroCoreCategories = new Set([
  "Monetary Policy",
  "Inflation",
  "Rates",
  "Liquidity",
  "Global Markets",
  "Risk Sentiment",
]);
const thematicCoreKeywords = [
  " ai ",
  "ai-",
  "bitcoin",
  " btc ",
  " eth ",
  "etf",
  "custody",
  "market structure",
  "liquidity",
  "rates",
  "inflation",
  "fomc",
  "chips",
  "chip ",
  "cloud",
  "cybersecurity",
  "security",
  "infrastructure",
  "zero trust",
];

export function hasEditorialOverride(item, field) {
  return item?.editorialOverride?.field === field;
}

export function expectedRecencyScore({ publishedAt, scoredAt }) {
  if (!scoredAt) {
    return null;
  }

  const publishedAtMs = Date.parse(publishedAt);
  const scoredAtMs = Date.parse(scoredAt);

  if (Number.isNaN(publishedAtMs) || Number.isNaN(scoredAtMs)) {
    return null;
  }

  const ageInHours = (scoredAtMs - publishedAtMs) / HOUR_IN_MS;

  if (ageInHours <= 2) return 20;
  if (ageInHours <= 6) return 15;
  if (ageInHours <= 24) return 10;
  if (ageInHours <= 72) return 5;
  return 0;
}

export function expectedSourceQualityScore({ sourceTier }) {
  switch (sourceTier) {
    case "primary":
      return 15;
    case "tier_1":
      return 12;
    case "tier_2":
      return 8;
    case "tier_3":
      return 3;
    default:
      return null;
  }
}

function normalizedThematicText(item) {
  const values = [
    item.section,
    item.category,
    ...(Array.isArray(item.tags) ? item.tags : []),
    item.title,
    item.summary,
    item.whyItMatters,
    item.impact,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return ` ${values} `;
}

export function expectedThematicRelevanceScore(item) {
  if (item.section === "Technology" && technologyCoreCategories.has(item.category)) {
    return 10;
  }

  if (item.section === "Crypto & Markets" && cryptoCoreCategories.has(item.category)) {
    return 10;
  }

  if (item.section === "Macro" && macroCoreCategories.has(item.category)) {
    return 10;
  }

  const text = normalizedThematicText(item);
  if (thematicCoreKeywords.some((keyword) => text.includes(keyword))) {
    return 10;
  }

  return null;
}
