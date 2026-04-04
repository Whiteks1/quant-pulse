import { Archive, Calendar, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArchivePreview() {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Archive className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Archive</h2>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 md:p-8">
        <p className="text-sm text-secondary-foreground mb-6">
          Browse past editions by date, category, or source.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-foreground border-border hover:bg-secondary">
            <Calendar className="h-3.5 w-3.5" />
            By Date
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-foreground border-border hover:bg-secondary">
            <Tag className="h-3.5 w-3.5" />
            By Category
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-foreground border-border hover:bg-secondary">
            <Globe className="h-3.5 w-3.5" />
            By Source
          </Button>
        </div>

        <div className="mt-6 grid gap-2 md:grid-cols-3">
          {["April 4, 2026", "April 3, 2026", "April 2, 2026"].map((date) => (
            <div
              key={date}
              className="rounded-md bg-surface-raised px-4 py-3 text-sm text-secondary-foreground hover:text-foreground cursor-pointer transition-colors flex items-center justify-between"
            >
              <span className="font-mono text-xs">{date}</span>
              <span className="text-xs text-muted-foreground">→</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
