const HOUR_IN_MS = 60 * 60 * 1000;

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
