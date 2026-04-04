import { executiveBrief } from "@/data/mockNews";
import { Zap } from "lucide-react";

export function ExecutiveBrief() {
  return (
    <section className="container py-12 md:py-16">
      <div className="flex items-center gap-2 mb-6">
        <Zap className="h-5 w-5 text-highlight" />
        <h2 className="text-xl md:text-2xl font-bold text-foreground">Today's Executive Brief</h2>
      </div>

      <div className="rounded-lg border border-highlight/20 bg-card p-5 md:p-6">
        <ol className="space-y-3">
          {executiveBrief.map((point, i) => (
            <li key={i} className="flex gap-3 text-sm md:text-base">
              <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-highlight/15 text-highlight font-mono text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-secondary-foreground leading-relaxed">{point}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
