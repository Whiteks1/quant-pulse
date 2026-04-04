import type { WatchItem } from "@/data/mockNews";
import { Eye, Calendar, Landmark, BarChart3, Radio } from "lucide-react";

const typeIcons = {
  earnings: BarChart3,
  regulation: Landmark,
  event: Radio,
  market: Calendar,
};

const typeColors = {
  earnings: "text-highlight",
  regulation: "text-noise",
  event: "text-primary",
  market: "text-accent",
};

export function WhatToWatch({ items }: { items: WatchItem[] }) {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="h-5 w-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">What to Watch</h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = typeIcons[item.type];
          return (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-4 card-hover flex gap-3"
            >
              <div className={`shrink-0 mt-0.5 ${typeColors[item.type]}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{item.title}</p>
                <p className="text-xs text-muted-foreground font-mono mt-1">{item.date}</p>
                <p className="text-xs text-secondary-foreground mt-1.5">{item.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
