import { cn } from "@/lib/utils";

export function RelevanceDot({ relevance }: { relevance: "high" | "medium" | "low" }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        relevance === "high" && "bg-accent",
        relevance === "medium" && "bg-highlight",
        relevance === "low" && "bg-muted-foreground"
      )}
      title={`${relevance} relevance`}
    />
  );
}
