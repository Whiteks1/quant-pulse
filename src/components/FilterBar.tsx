import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { sections, categories } from "@/data/mockNews";
import { cn } from "@/lib/utils";

interface FilterBarProps {
  activeSection: string;
  activeCategory: string;
  searchQuery: string;
  onSectionChange: (s: string) => void;
  onCategoryChange: (c: string) => void;
  onSearchChange: (q: string) => void;
}

export function FilterBar({
  activeSection,
  activeCategory,
  searchQuery,
  onSectionChange,
  onCategoryChange,
  onSearchChange,
}: FilterBarProps) {
  const [showCategories, setShowCategories] = useState(false);

  return (
    <div className="container py-6 space-y-4 sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-border">
      {/* Search + toggle */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search signals..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-lg border border-border bg-card pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <button
          onClick={() => setShowCategories(!showCategories)}
          type="button"
          aria-label="Toggle category filters"
          aria-expanded={showCategories}
          className={cn(
            "rounded-lg border border-border px-3 py-2.5 transition-colors",
            showCategories ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {sections.map((s) => (
          <button
            key={s}
            onClick={() => onSectionChange(s)}
            className={cn(
              "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              activeSection === s
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:text-foreground"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Category chips */}
      {showCategories && (
        <div className="flex gap-1.5 flex-wrap animate-fade-in-up">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => onCategoryChange(c)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium border transition-colors",
                activeCategory === c
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-card text-muted-foreground border-border hover:text-foreground"
              )}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
