/** Alineado con docs/priority-rules.es.md (P1 ≥70, P2 40–69, P3 por debajo de 40). */
export function relevanceTierFromScore(score: number): "high" | "medium" | "low" {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}
