import { useRef, useState, useMemo } from "react";
import { mockNews } from "@/data/mockNews";
import { Hero } from "@/components/Hero";
import { ExecutiveBrief } from "@/components/ExecutiveBrief";
import { FeaturedStories } from "@/components/FeaturedStories";
import { NewsSection } from "@/components/NewsSection";
import { SignalVsNoise } from "@/components/SignalVsNoise";
import { WhatToWatch } from "@/components/WhatToWatch";
import { ArchivePreview } from "@/components/ArchivePreview";
import { SiteFooter } from "@/components/SiteFooter";
import { FilterBar } from "@/components/FilterBar";

const Index = () => {
  const pulseRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState("All");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNews = useMemo(() => {
    return mockNews.filter((item) => {
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
  }, [activeSection, activeCategory, searchQuery]);

  const handleViewPulse = () => {
    pulseRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onViewPulse={handleViewPulse} />

      <div ref={pulseRef}>
        <ExecutiveBrief />
      </div>

      <FilterBar
        activeSection={activeSection}
        activeCategory={activeCategory}
        searchQuery={searchQuery}
        onSectionChange={setActiveSection}
        onCategoryChange={setActiveCategory}
        onSearchChange={setSearchQuery}
      />

      <FeaturedStories items={filteredNews} />
      <NewsSection title="Technology" section="Technology" items={filteredNews} />
      <NewsSection title="Crypto & Markets" section="Crypto & Markets" items={filteredNews} />
      <NewsSection title="Macro" section="Macro" items={filteredNews} />
      <SignalVsNoise items={filteredNews} />
      <WhatToWatch />
      <ArchivePreview />
      <SiteFooter />
    </div>
  );
};

export default Index;
