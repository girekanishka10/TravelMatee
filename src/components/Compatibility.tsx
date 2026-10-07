import type { CompatibilityBreakdown } from "@/lib/types";

export function CompatibilityBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-forest/30 bg-forest/5 px-2.5 py-1 text-xs font-medium text-forest">
      <span>●</span>
      <span>{value}% Compatible</span>
    </span>
  );
}

export function Breakdown({ score }: { score: CompatibilityBreakdown }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-line pb-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Travel Compatibility</p>
          <p className="mt-0.5 text-2xl font-semibold text-forest">{score.overall}% Match</p>
        </div>
        <span className="rounded-full bg-sand px-3 py-1 text-xs text-ink font-medium">
          {score.overall >= 85 ? "Strong fit" : score.overall >= 70 ? "Good fit" : "Partial fit"}
        </span>
      </div>

      {score.highlights && score.highlights.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted">Strong match on:</p>
          <ul className="mt-1.5 space-y-1">
            {score.highlights.map((h, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-ink">
                <span className="h-1.5 w-1.5 rounded-full bg-forest shrink-0" />
                <span>{h}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {score.penalties && score.penalties.length > 0 && (
        <div className="rounded-xl bg-sand/60 px-3 py-2 text-xs text-muted">
          <p className="font-medium text-ink">Note for planning:</p>
          <ul className="mt-1 space-y-0.5">
            {score.penalties.map((p, i) => (
              <li key={i}>• {p}</li>
            ))}
          </ul>
        </div>
      )}

      {score.differences && score.differences.length > 0 && (
        <div className="pt-1">
          <p className="text-xs text-muted">Preferences to align beforehand:</p>
          <p className="mt-0.5 text-xs text-muted">{score.differences.join(" • ")}</p>
        </div>
      )}
    </div>
  );
}
