import type { NewsItem } from "@/data/mockNews";
import { NewsCard } from "./NewsCard";
import { Star } from "lucide-react";

export function FeaturedStories({ items }: { items: NewsItem[] }) {
  const featured = items.filter((n) => n.featured);

  if (featured.length === 0) return null;

  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Star className="h-5 w-5 text-highlight" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Featured Stories</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {featured.map((item) => (
          <NewsCard key={item.id} item={item} variant="featured" />
        ))}
      </div>
    </section>
  );
}
