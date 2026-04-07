import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Archive, Calendar, Globe2, RotateCcw } from "lucide-react";
import { ArchiveContinuity } from "@/components/ArchiveContinuity";
import { ArchiveIntelligence } from "@/components/ArchiveIntelligence";
import { Button } from "@/components/ui/button";
import { fetchArchiveEdition } from "@/data/loadArchiveData";
import type { PulseBundle } from "@/data/loadPulseData";
import { EmptyFeedState } from "@/components/EmptyFeedState";
import { FeedStatusBar } from "@/components/FeedStatusBar";
import { FilterBar } from "@/components/FilterBar";
import { NewsCard } from "@/components/NewsCard";
import { SiteFooter } from "@/components/SiteFooter";
import { useArchiveEdition } from "@/hooks/useArchiveEdition";
import { buildArchiveContinuity } from "@/lib/archive-continuity";
import { buildArchiveEditionComparison, getComparisonEdition } from "@/lib/archive-intelligence";
import { buildArchivePreviewData, groupArchiveItemsByDate } from "@/lib/archive-preview";
import { buildArchiveRouteSearchParams, parseArchiveRouteState } from "@/lib/archive-route";
import { getFeedStats } from "@/lib/feed-status";

const ArchivePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialState = useMemo(() => parseArchiveRouteState(searchParams), [searchParams]);
  const activeEdition = initialState.edition;
  const [activeSection, setActiveSection] = useState(initialState.section);
  const [activeCategory, setActiveCategory] = useState(initialState.category);
  const [searchQuery, setSearchQuery] = useState(initialState.query);
  const [activeDate, setActiveDate] = useState(initialState.date);
  const [activeSource, setActiveSource] = useState(initialState.source);
  const [comparisonBundle, setComparisonBundle] = useState<PulseBundle | null>(null);
  const { index, selectedEdition, bundle, loadState, loadError } = useArchiveEdition(activeEdition);

  useEffect(() => {
    if (activeSection !== initialState.section) {
      setActiveSection(initialState.section);
    }
    if (activeCategory !== initialState.category) {
      setActiveCategory(initialState.category);
    }
    if (searchQuery !== initialState.query) {
      setSearchQuery(initialState.query);
    }
    if (activeDate !== initialState.date) {
      setActiveDate(initialState.date);
    }
    if (activeSource !== initialState.source) {
      setActiveSource(initialState.source);
    }
  }, [
    activeCategory,
    activeDate,
    activeSection,
    activeSource,
    initialState.category,
    initialState.date,
    initialState.query,
    initialState.section,
    initialState.source,
    searchQuery,
  ]);

  useEffect(() => {
    const nextParams = buildArchiveRouteSearchParams({
      edition: activeEdition,
      section: activeSection,
      category: activeCategory,
      query: searchQuery,
      date: activeDate,
      source: activeSource,
    });

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [
    activeEdition,
    activeCategory,
    activeDate,
    activeSection,
    activeSource,
    searchParams,
    searchQuery,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!selectedEdition || !index) return;

    const editionExistsInIndex = index.editions.some((edition) => edition.slug === activeEdition);
    if (!editionExistsInIndex) {
      const nextParams = buildArchiveRouteSearchParams({
        edition: selectedEdition.slug,
        section: activeSection,
        category: activeCategory,
        query: searchQuery,
        date: activeDate,
        source: activeSource,
      });

      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [
    activeCategory,
    activeDate,
    activeEdition,
    activeSection,
    activeSource,
    index,
    searchParams,
    searchQuery,
    selectedEdition,
    setSearchParams,
  ]);

  const items = useMemo(() => bundle?.items ?? [], [bundle]);
  const updatedAt = bundle?.updatedAt ?? "";
  const version = bundle?.version ?? 0;
  const comparisonEdition = useMemo(
    () => (index && selectedEdition ? getComparisonEdition(index.editions, selectedEdition.slug) : null),
    [index, selectedEdition]
  );

  useEffect(() => {
    if (!comparisonEdition) {
      setComparisonBundle(null);
      return;
    }

    let cancelled = false;

    fetchArchiveEdition(comparisonEdition.path)
      .then((nextBundle) => {
        if (cancelled) return;
        setComparisonBundle(nextBundle);
      })
      .catch(() => {
        if (cancelled) return;
        setComparisonBundle(null);
      });

    return () => {
      cancelled = true;
    };
  }, [comparisonEdition]);

  const baseFilteredItems = useMemo(() => {
    return items.filter((item) => {
      if (activeSection !== "All" && item.section !== activeSection) return false;
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (searchQuery) {
        const normalizedQuery = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(normalizedQuery) ||
          item.summary.toLowerCase().includes(normalizedQuery) ||
          item.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
        );
      }
      return true;
    });
  }, [activeCategory, activeSection, items, searchQuery]);

  const filteredItems = useMemo(() => {
    return baseFilteredItems.filter((item) => {
      if (activeDate && !item.publishedAt.startsWith(activeDate)) return false;
      if (activeSource && item.source !== activeSource) return false;
      return true;
    });
  }, [activeDate, activeSource, baseFilteredItems]);

  const archivePreview = useMemo(
    () => buildArchivePreviewData(baseFilteredItems),
    [baseFilteredItems]
  );
  const groupedItems = useMemo(() => groupArchiveItemsByDate(filteredItems), [filteredItems]);
  const stats = useMemo(() => getFeedStats(filteredItems), [filteredItems]);
  const archiveComparison = useMemo(() => {
    if (!selectedEdition || !comparisonEdition || !comparisonBundle) return null;

    return buildArchiveEditionComparison(
      selectedEdition,
      comparisonEdition,
      bundle?.items ?? [],
      comparisonBundle.items
    );
  }, [bundle?.items, comparisonBundle, comparisonEdition, selectedEdition]);
  const archiveContinuity = useMemo(
    () => buildArchiveContinuity(index?.editions ?? [], selectedEdition?.slug ?? null, comparisonEdition?.slug ?? null),
    [comparisonEdition?.slug, index?.editions, selectedEdition?.slug]
  );

  const handleResetAll = () => {
    setActiveSection("All");
    setActiveCategory("All");
    setSearchQuery("");
    setActiveDate("");
    setActiveSource("");
  };

  const handleResetArchiveFacets = () => {
    setActiveDate("");
    setActiveSource("");
  };

  const handleEditionSelect = (edition: string) => {
    const nextParams = buildArchiveRouteSearchParams({
      edition,
      section: activeSection,
      category: activeCategory,
      query: searchQuery,
      date: activeDate,
      source: activeSource,
    });

    setSearchParams(nextParams, { replace: true });
  };

  const extraFilters = [
    activeDate ? `date: ${activeDate}` : null,
    activeSource ? `source: ${activeSource}` : null,
  ].filter((value): value is string => Boolean(value));

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground font-mono">Loading archive…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-foreground">Could not load archive data</p>
        <p className="text-xs text-muted-foreground font-mono max-w-md">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <section className="container py-10 md:py-14 space-y-5">
        <Button variant="ghost" asChild className="px-0 text-muted-foreground hover:text-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" />
            Back to live pulse
          </Link>
        </Button>

        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Archive className="h-3.5 w-3.5" />
              Quant Pulse Archive
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Review archive editions and source concentration
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-secondary-foreground leading-relaxed">
              Archive mode now loads a published edition manifest, so each archived snapshot can be
              explored without introducing backend infrastructure.
            </p>
          </div>

          <div className="flex gap-2">
            {(activeDate || activeSource) ? (
              <Button variant="outline" onClick={handleResetArchiveFacets}>
                <RotateCcw className="h-4 w-4" />
                Clear archive facets
              </Button>
            ) : null}
            <Button variant="outline" onClick={handleResetAll}>
              Reset all filters
            </Button>
          </div>
        </div>
      </section>

      <FeedStatusBar
        updatedAt={updatedAt}
        version={version}
        totalItems={stats.totalItems}
        signalCount={stats.signalCount}
        p1Count={stats.p1Count}
      />

      <section className="container py-8 space-y-4">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
            <Archive className="h-3.5 w-3.5" />
            Published Editions
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {index?.editions.map((edition) => (
              <Button
                key={edition.slug}
                variant={activeEdition === edition.slug ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => handleEditionSelect(edition.slug)}
              >
                {edition.label}
                <span className="text-[11px] font-mono opacity-80">v{edition.version}</span>
              </Button>
            ))}
          </div>

          {selectedEdition ? (
            <p className="mt-4 text-xs font-mono text-muted-foreground">
              Selected edition: {selectedEdition.label} • {selectedEdition.totalItems} stories •{" "}
              {selectedEdition.signalCount} signals • {selectedEdition.p1Count} P1
            </p>
          ) : null}
        </div>
      </section>

      <ArchiveContinuity continuity={archiveContinuity} onSelectEdition={handleEditionSelect} />

      <ArchiveIntelligence comparison={archiveComparison} />

      <FilterBar
        activeSection={activeSection}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSectionChange={setActiveSection}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      <section className="container py-8 space-y-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Dates in Edition
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {archivePreview.editions.map((edition) => (
                <Button
                  key={edition.dateKey}
                  variant={activeDate === edition.dateKey ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setActiveDate((currentValue) =>
                      currentValue === edition.dateKey ? "" : edition.dateKey
                    )
                  }
                >
                  {edition.label}
                  <span className="text-[11px] font-mono opacity-80">{edition.totalItems}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5" />
              Sources
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {archivePreview.sources.map((entry) => (
                <Button
                  key={entry.value}
                  variant={activeSource === entry.value ? "default" : "outline"}
                  size="sm"
                  className="gap-2"
                  onClick={() =>
                    setActiveSource((currentValue) =>
                      currentValue === entry.value ? "" : entry.value
                    )
                  }
                >
                  {entry.value}
                  <span className="text-[11px] font-mono opacity-80">{entry.count}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <EmptyFeedState
          activeSection={activeSection}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          extraFilters={extraFilters}
          onReset={handleResetAll}
        />
      ) : (
        <section className="container pb-16 space-y-10">
          {groupedItems.map((group) => (
            <div key={group.dateKey} className="space-y-4">
              <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">{group.label}</h2>
                  <p className="text-xs font-mono text-muted-foreground">
                    {group.items.length} stories
                  </p>
                </div>
                <Button
                  variant={activeDate === group.dateKey ? "default" : "ghost"}
                  size="sm"
                  onClick={() =>
                    setActiveDate((currentValue) =>
                      currentValue === group.dateKey ? "" : group.dateKey
                    )
                  }
                >
                  {activeDate === group.dateKey ? "Viewing edition" : "Focus edition"}
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      <SiteFooter updatedAt={updatedAt} version={version} />
    </div>
  );
};

export default ArchivePage;
