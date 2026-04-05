import { Link } from "react-router-dom";
import { Archive, Calendar, Tag, Globe, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NewsItem } from "@/data/mockNews";
import { buildArchivePreviewData } from "@/lib/archive-preview";
import { buildArchiveHref } from "@/lib/archive-route";

interface ArchivePreviewProps {
  items: NewsItem[];
}

export function ArchivePreview({ items }: ArchivePreviewProps) {
  const preview = buildArchivePreviewData(items);

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Archive className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Archive</h2>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <p className="text-sm text-secondary-foreground mb-6">
          Preview the current archive surface by edition date, dominant category, and source concentration.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr_1fr]">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              By Date
            </div>
            <div className="grid gap-2">
              {preview.editions.map((edition) => (
                <Link
                  key={edition.dateKey}
                  to={buildArchiveHref({
                    edition: "current",
                    section: "All",
                    category: "All",
                    query: "",
                    date: edition.dateKey,
                    source: "",
                  })}
                  className="rounded-md bg-surface-raised px-4 py-3 text-sm text-secondary-foreground flex items-center justify-between transition-colors hover:bg-secondary"
                >
                  <div>
                    <p className="font-mono text-xs text-foreground">{edition.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edition.totalItems} stories · {edition.signalCount} signals
                    </p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              By Category
            </div>
            <div className="flex flex-wrap gap-2">
              {preview.categories.map((entry) => (
                <Button key={entry.value} variant="outline" size="sm" className="gap-2" asChild>
                  <Link
                    to={buildArchiveHref({
                      edition: "current",
                      section: "All",
                      category: entry.value,
                      query: "",
                      date: "",
                      source: "",
                    })}
                  >
                    {entry.value}
                    <span className="text-[11px] font-mono opacity-80">{entry.count}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.18em] text-muted-foreground">
              <Globe className="h-3.5 w-3.5" />
              By Source
            </div>
            <div className="flex flex-wrap gap-2">
              {preview.sources.map((entry) => (
                <Button key={entry.value} variant="outline" size="sm" className="gap-2" asChild>
                  <Link
                    to={buildArchiveHref({
                      edition: "current",
                      section: "All",
                      category: "All",
                      query: "",
                      date: "",
                      source: entry.value,
                    })}
                  >
                    {entry.value}
                    <span className="text-[11px] font-mono opacity-80">{entry.count}</span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button variant="ghost" asChild>
            <Link to="/archive">
              Open full archive
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
