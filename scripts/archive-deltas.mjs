const priorityRank = { P1: 0, P2: 1, P3: 2 };

function storyKey(item) {
  return item.dedupeKey || item.id;
}

function comparePriority(current, previous) {
  return priorityRank[current.priority] - priorityRank[previous.priority];
}

function sortStories(items) {
  return [...items].sort((left, right) => {
    const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority];
    if (priorityDelta !== 0) return priorityDelta;
    if (left.signalVsNoise !== right.signalVsNoise) {
      return left.signalVsNoise === "signal" ? -1 : 1;
    }
    return right.relevanceScore - left.relevanceScore;
  });
}

function sortPriorityChanges(changes) {
  return [...changes].sort((left, right) => {
    const leftMagnitude = Math.abs(comparePriority(left.current, left.previous));
    const rightMagnitude = Math.abs(comparePriority(right.current, right.previous));
    if (leftMagnitude !== rightMagnitude) return rightMagnitude - leftMagnitude;

    const priorityDelta = priorityRank[left.current.priority] - priorityRank[right.current.priority];
    if (priorityDelta !== 0) return priorityDelta;

    return right.current.relevanceScore - left.current.relevanceScore;
  });
}

function sortBriefs(items) {
  return [...items].sort((left, right) => left.id.localeCompare(right.id));
}

function sortWatchItems(items) {
  return [...items].sort((left, right) => left.title.localeCompare(right.title));
}

function formatStoryMeta(item) {
  return `${item.section} • ${item.category} • ${item.source}`;
}

function buildHighlights({
  addedStories,
  removedStories,
  raisedStories,
  loweredStories,
  addedBriefs,
  removedBriefs,
  addedWatchItems,
  removedWatchItems,
}) {
  const candidates = [
    raisedStories[0]
      ? {
          id: `priority-raised:${storyKey(raisedStories[0].current)}`,
          kind: "priority-raised",
          label: `Priority raised to ${raisedStories[0].current.priority}`,
          title: raisedStories[0].current.title,
          detail: raisedStories[0].current.whyItMatters,
          meta: formatStoryMeta(raisedStories[0].current),
        }
      : null,
    addedStories[0]
      ? {
          id: `new-story:${storyKey(addedStories[0])}`,
          kind: "new-story",
          label: addedStories[0].priority === "P1" ? "New P1 story" : "New tracked story",
          title: addedStories[0].title,
          detail: addedStories[0].whyItMatters,
          meta: formatStoryMeta(addedStories[0]),
        }
      : null,
    removedStories[0]
      ? {
          id: `removed-story:${storyKey(removedStories[0])}`,
          kind: "removed-story",
          label: "No longer in latest edition",
          title: removedStories[0].title,
          detail: removedStories[0].whyItMatters,
          meta: formatStoryMeta(removedStories[0]),
        }
      : null,
    loweredStories[0]
      ? {
          id: `priority-lowered:${storyKey(loweredStories[0].current)}`,
          kind: "priority-lowered",
          label: `Priority lowered to ${loweredStories[0].current.priority}`,
          title: loweredStories[0].current.title,
          detail: loweredStories[0].current.whyItMatters,
          meta: formatStoryMeta(loweredStories[0].current),
        }
      : null,
    addedBriefs[0]
      ? {
          id: `brief-added:${addedBriefs[0].id}`,
          kind: "brief-added",
          label: "New brief angle",
          title: addedBriefs[0].text,
          detail: `Linked item: ${addedBriefs[0].itemId}`,
          meta: "Executive brief",
        }
      : null,
    addedWatchItems[0]
      ? {
          id: `watch-added:${addedWatchItems[0].id}`,
          kind: "watch-added",
          label: "New watch item",
          title: addedWatchItems[0].title,
          detail: addedWatchItems[0].whyWatch,
          meta: `${addedWatchItems[0].section} • ${addedWatchItems[0].category}`,
        }
      : null,
    removedWatchItems[0]
      ? {
          id: `watch-removed:${removedWatchItems[0].id}`,
          kind: "watch-removed",
          label: "Watch item removed",
          title: removedWatchItems[0].title,
          detail: removedWatchItems[0].whyWatch,
          meta: `${removedWatchItems[0].section} • ${removedWatchItems[0].category}`,
        }
      : null,
    removedBriefs[0]
      ? {
          id: `brief-removed:${removedBriefs[0].id}`,
          kind: "brief-removed",
          label: "Brief angle removed",
          title: removedBriefs[0].text,
          detail: `Linked item: ${removedBriefs[0].itemId}`,
          meta: "Executive brief",
        }
      : null,
  ];

  return candidates.filter(Boolean);
}

function hasMaterialChanges(summary) {
  return [
    summary.storyChanges.added,
    summary.storyChanges.removed,
    summary.storyChanges.priorityRaised,
    summary.storyChanges.priorityLowered,
    summary.executiveBriefChanges.added,
    summary.executiveBriefChanges.removed,
    summary.watchChanges.added,
    summary.watchChanges.removed,
  ].some((count) => count > 0);
}

export function buildArchiveEditionDeltaArtifact({ edition, baseline, generatedAt }) {
  const previousByKey = new Map(baseline.bundle.items.map((item) => [storyKey(item), item]));
  const currentByKey = new Map(edition.bundle.items.map((item) => [storyKey(item), item]));
  const baselineBriefsById = new Map(baseline.bundle.executiveBrief.map((brief) => [brief.id, brief]));
  const editionBriefsById = new Map(edition.bundle.executiveBrief.map((brief) => [brief.id, brief]));
  const baselineWatchById = new Map(baseline.bundle.watchItems.map((item) => [item.id, item]));
  const editionWatchById = new Map(edition.bundle.watchItems.map((item) => [item.id, item]));

  const addedStories = sortStories(
    edition.bundle.items.filter((item) => !previousByKey.has(storyKey(item)))
  );
  const removedStories = sortStories(
    baseline.bundle.items.filter((item) => !currentByKey.has(storyKey(item)))
  );
  const raisedStories = sortPriorityChanges(
    edition.bundle.items.flatMap((item) => {
      const previousItem = previousByKey.get(storyKey(item));
      if (!previousItem || previousItem.priority === item.priority) return [];
      if (comparePriority(item, previousItem) < 0) {
        return [{ current: item, previous: previousItem }];
      }
      return [];
    })
  );
  const loweredStories = sortPriorityChanges(
    edition.bundle.items.flatMap((item) => {
      const previousItem = previousByKey.get(storyKey(item));
      if (!previousItem || previousItem.priority === item.priority) return [];
      if (comparePriority(item, previousItem) > 0) {
        return [{ current: item, previous: previousItem }];
      }
      return [];
    })
  );
  const addedBriefs = sortBriefs(
    edition.bundle.executiveBrief.filter((brief) => !baselineBriefsById.has(brief.id))
  );
  const removedBriefs = sortBriefs(
    baseline.bundle.executiveBrief.filter((brief) => !editionBriefsById.has(brief.id))
  );
  const addedWatchItems = sortWatchItems(
    edition.bundle.watchItems.filter((item) => !baselineWatchById.has(item.id))
  );
  const removedWatchItems = sortWatchItems(
    baseline.bundle.watchItems.filter((item) => !editionWatchById.has(item.id))
  );

  const summary = {
    totals: {
      current: edition.totalItems,
      previous: baseline.totalItems,
      delta: edition.totalItems - baseline.totalItems,
    },
    signals: {
      current: edition.signalCount,
      previous: baseline.signalCount,
      delta: edition.signalCount - baseline.signalCount,
    },
    p1: {
      current: edition.p1Count,
      previous: baseline.p1Count,
      delta: edition.p1Count - baseline.p1Count,
    },
    storyChanges: {
      added: addedStories.length,
      removed: removedStories.length,
      priorityRaised: raisedStories.length,
      priorityLowered: loweredStories.length,
    },
    executiveBriefChanges: {
      added: addedBriefs.length,
      removed: removedBriefs.length,
    },
    watchChanges: {
      added: addedWatchItems.length,
      removed: removedWatchItems.length,
    },
  };

  return {
    generatedAt,
    edition: {
      slug: edition.slug,
      label: edition.label,
      updatedAt: edition.updatedAt,
      version: edition.version,
      path: edition.path,
    },
    baseline: {
      slug: baseline.slug,
      label: baseline.label,
      updatedAt: baseline.updatedAt,
      version: baseline.version,
      path: baseline.path,
    },
    summary,
    hasMaterialChanges: hasMaterialChanges(summary),
    highlights: buildHighlights({
      addedStories,
      removedStories,
      raisedStories,
      loweredStories,
      addedBriefs,
      removedBriefs,
      addedWatchItems,
      removedWatchItems,
    }),
  };
}

export function buildArchiveDeltaArtifacts(editions, { generatedAt }) {
  const sortedEditions = [...editions].sort((left, right) => {
    if (left.updatedAt !== right.updatedAt) {
      return left.updatedAt.localeCompare(right.updatedAt);
    }
    return left.slug.localeCompare(right.slug);
  });

  const deltaArtifacts = [];

  for (let index = 1; index < sortedEditions.length; index += 1) {
    const baseline = sortedEditions[index - 1];
    const edition = sortedEditions[index];
    const artifact = buildArchiveEditionDeltaArtifact({
      edition,
      baseline,
      generatedAt,
    });

    deltaArtifacts.push({
      editionSlug: edition.slug,
      artifact,
    });
  }

  const deltas = deltaArtifacts
    .map(({ editionSlug, artifact }) => ({
      editionSlug,
      baselineSlug: artifact.baseline.slug,
      updatedAt: artifact.edition.updatedAt,
      path: `data/archive/deltas/${editionSlug}.json`,
      hasMaterialChanges: artifact.hasMaterialChanges,
      highlightCount: artifact.highlights.length,
      storyChanges: artifact.summary.storyChanges,
      executiveBriefChanges: artifact.summary.executiveBriefChanges,
      watchChanges: artifact.summary.watchChanges,
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));

  return {
    deltaArtifacts,
    deltaIndex: {
      generatedAt,
      deltas,
    },
  };
}
