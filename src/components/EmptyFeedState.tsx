import { RotateCcw, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyFeedStateProps {
  activeSection: string;
  activeCategory: string;
  searchQuery: string;
  onReset: () => void;
}

export function EmptyFeedState({
  activeSection,
  activeCategory,
  searchQuery,
  onReset,
}: EmptyFeedStateProps) {
  const filters = [
    activeSection !== "All" ? `section: ${activeSection}` : null,
    activeCategory !== "All" ? `category: ${activeCategory}` : null,
    searchQuery.trim() ? `query: "${searchQuery.trim()}"` : null,
  ].filter(Boolean);

  return (
    <section className="container py-12">
      <div className="rounded-2xl border border-dashed border-border bg-card/60 px-6 py-10 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <SearchX className="h-5 w-5" />
        </div>
        <h2 className="mt-4 text-xl font-semibold text-foreground">No stories match these filters</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Quant Pulse did not find stories for the current filter set.
        </p>
        {filters.length > 0 ? (
          <p className="mt-3 text-xs font-mono text-muted-foreground">{filters.join(" • ")}</p>
        ) : null}
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={onReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset Filters
          </Button>
        </div>
      </div>
    </section>
  );
}
