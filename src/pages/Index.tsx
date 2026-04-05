import { useRef, useState, useMemo, useEffect } from "react";
import type { ExecutiveBriefItem, NewsItem, WatchItem } from "@/data/mockNews";
import { fetchPulseData } from "@/data/loadPulseData";
import { useSearchParams } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { ExecutiveBrief } from "@/components/ExecutiveBrief";
import { FeaturedStories } from "@/components/FeaturedStories";
import { NewsSection } from "@/components/NewsSection";
import { SignalVsNoise } from "@/components/SignalVsNoise";
import { WhatToWatch } from "@/components/WhatToWatch";
import { ArchivePreview } from "@/components/ArchivePreview";
import { SiteFooter } from "@/components/SiteFooter";
import { FilterBar } from "@/components/FilterBar";
import { FeedStatusBar } from "@/components/FeedStatusBar";
import { EmptyFeedState } from "@/components/EmptyFeedState";
import { getFeedStats, hasActiveFilters } from "@/lib/feed-status";
import { buildFeedFilterSearchParams, parseFeedFilterState } from "@/lib/feed-filters";

const Index = () => {
  const pulseRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilters = useMemo(() => parseFeedFilterState(searchParams), [searchParams]);
  const [activeSection, setActiveSection] = useState(initialFilters.section);
  const [activeCategory, setActiveCategory] = useState(initialFilters.category);
  const [searchQuery, setSearchQuery] = useState(initialFilters.query);
  const [items, setItems] = useState<NewsItem[]>([]);
  const [executiveBrief, setExecutiveBrief] = useState<ExecutiveBriefItem[]>([]);
  const [watchItems, setWatchItems] = useState<WatchItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [version, setVersion] = useState(0);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "error">("loading");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPulseData()
      .then((bundle) => {
        if (cancelled) return;
        setItems(bundle.items);
        setExecutiveBrief(bundle.executiveBrief);
        setWatchItems(bundle.watchItems);
        setUpdatedAt(bundle.updatedAt);
        setVersion(bundle.version);
        setLoadState("ok");
        setLoadError(null);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setLoadState("error");
        setLoadError(e instanceof Error ? e.message : "Unknown error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (activeSection !== initialFilters.section) {
      setActiveSection(initialFilters.section);
    }
    if (activeCategory !== initialFilters.category) {
      setActiveCategory(initialFilters.category);
    }
    if (searchQuery !== initialFilters.query) {
      setSearchQuery(initialFilters.query);
    }
  }, [activeCategory, activeSection, initialFilters.category, initialFilters.query, initialFilters.section, searchQuery]);

  useEffect(() => {
    const nextParams = buildFeedFilterSearchParams({
      section: activeSection,
      category: activeCategory,
      query: searchQuery,
    });

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [activeCategory, activeSection, searchParams, searchQuery, setSearchParams]);

  const filteredNews = useMemo(() => {
    return items.filter((item) => {
      if (activeSection !== "All" && item.section !== activeSection) return false;
      if (activeCategory !== "All" && item.category !== activeCategory) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [items, activeSection, activeCategory, searchQuery]);

  const stats = useMemo(() => getFeedStats(items), [items]);
  const showEmptyState = filteredNews.length === 0 && hasActiveFilters(activeSection, activeCategory, searchQuery);

  const handleViewPulse = () => {
    pulseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setActiveSection("All");
    setActiveCategory("All");
    setSearchQuery("");
  };

  const handleArchiveCategorySelect = (value: string) => {
    setActiveCategory(value);
    pulseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleArchiveSourceSelect = (value: string) => {
    setSearchQuery(value);
    pulseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (loadState === "loading") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground font-mono">Loading pulse…</p>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-3 px-4 text-center">
        <p className="text-sm font-medium text-foreground">Could not load pulse data</p>
        <p className="text-xs text-muted-foreground font-mono max-w-md">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Hero
        onViewPulse={handleViewPulse}
        updatedAt={updatedAt}
        totalItems={stats.totalItems}
        signalCount={stats.signalCount}
      />

      <div ref={pulseRef}>
        <ExecutiveBrief points={executiveBrief} />
      </div>

      <FeedStatusBar
        updatedAt={updatedAt}
        version={version}
        totalItems={stats.totalItems}
        signalCount={stats.signalCount}
        p1Count={stats.p1Count}
      />

      <FilterBar
        activeSection={activeSection}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSectionChange={setActiveSection}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      {showEmptyState ? (
        <EmptyFeedState
          activeSection={activeSection}
          activeCategory={activeCategory}
          searchQuery={searchQuery}
          onReset={handleResetFilters}
        />
      ) : (
        <>
          <FeaturedStories items={filteredNews} />
          <NewsSection title="Technology" section="Technology" items={filteredNews} />
          <NewsSection title="Crypto & Markets" section="Crypto & Markets" items={filteredNews} />
          <NewsSection title="Macro" section="Macro" items={filteredNews} />
          <SignalVsNoise items={filteredNews} />
        </>
      )}
      <WhatToWatch items={watchItems} />
      <ArchivePreview
        items={items}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onCategorySelect={handleArchiveCategorySelect}
        onSourceSelect={handleArchiveSourceSelect}
      />
      <SiteFooter updatedAt={updatedAt} version={version} />
    </div>
  );
};

export default Index;
