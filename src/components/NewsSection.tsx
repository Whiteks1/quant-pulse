import type { NewsItem, QuantPulseSection } from "@/data/mockNews";
import { NewsCard } from "./NewsCard";
import { Cpu, Globe, TrendingUp } from "lucide-react";

interface NewsSectionProps {
  title: string;
  section: QuantPulseSection;
  items: NewsItem[];
}

const sectionIcons: Record<QuantPulseSection, typeof Cpu> = {
  Technology: Cpu,
  "Crypto & Markets": TrendingUp,
  Macro: Globe,
};

export function NewsSection({ title, section, items }: NewsSectionProps) {
  const filtered = items.filter((n) => n.section === section && !n.featured);
  const Icon = sectionIcons[section];

  if (filtered.length === 0) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Icon className="h-5 w-5 text-primary" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
        <span className="ml-2 text-xs font-mono text-muted-foreground bg-secondary rounded-full px-2 py-0.5">
          {filtered.length}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
