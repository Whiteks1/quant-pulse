import { Activity, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatFeedTimestamp } from "@/lib/feed-status";

interface HeroProps {
  onViewPulse: () => void;
  updatedAt: string;
  totalItems: number;
  signalCount: number;
}

export function Hero({ onViewPulse, updatedAt, totalItems, signalCount }: HeroProps) {
  return (
    <section className="bg-gradient-hero relative overflow-hidden">
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div className="container relative py-20 md:py-32 flex flex-col items-center text-center gap-6">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-8 w-8 text-primary animate-pulse-glow" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
            <span className="text-gradient-primary">Quant</span>{" "}
            <span className="text-foreground">Pulse</span>
          </h1>
        </div>

        <p className="text-lg md:text-xl font-medium text-primary font-mono tracking-wide">
          Signal over noise in tech & crypto
        </p>

        <p className="max-w-2xl text-secondary-foreground text-sm md:text-base leading-relaxed">
          A curated stream of the most relevant tech and crypto developments,
          summarized for fast decision-making.
        </p>

        <div className="flex gap-3 mt-4">
          <Button
            size="lg"
            onClick={onViewPulse}
            className="bg-gradient-primary text-primary-foreground font-semibold px-6 hover:opacity-90 transition-opacity"
          >
            <Activity className="mr-2 h-4 w-4" />
            View Today's Pulse
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-border text-foreground hover:bg-secondary"
          >
            <Archive className="mr-2 h-4 w-4" />
            Browse Archive
          </Button>
        </div>

        <p className="text-xs text-muted-foreground font-mono mt-6">
          Updated {formatFeedTimestamp(updatedAt)} UTC • {totalItems} stories tracked • {signalCount} signals
        </p>
      </div>
    </section>
  );
}
