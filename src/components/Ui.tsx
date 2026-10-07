import { ACTIVITY_OPTIONS } from "@/lib/quiz";
import { getInitials } from "@/lib/format";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sand px-2.5 py-1 text-xs text-ink">
      {children}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-xs font-medium text-forest">
      ✓ Verified
    </span>
  );
}

export function ActivityChips({ ids }: { ids: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ids.map((id) => {
        const a = ACTIVITY_OPTIONS.find((x) => x.id === id);
        return (
          <Badge key={id}>
            {a ? a.label : id}
          </Badge>
        );
      })}
    </div>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="text-sm">
      ⭐ {value.toFixed(1)}/5
    </span>
  );
}

export function Avatar({
  name,
  photo,
  size = "md",
  className = "",
}: {
  name: string;
  photo?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const initials = getInitials(name);
  const sizeClasses = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-xs font-medium",
    md: "h-11 w-11 text-xs font-semibold",
    lg: "h-14 w-14 text-sm font-bold",
    xl: "h-16 w-16 text-base font-bold",
  }[size];

  if (photo && photo.trim().length > 0) {
    return (
      <img
        src={photo}
        alt={name}
        className={`rounded-full object-cover border border-line shrink-0 ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <div
      aria-label={name}
      className={`rounded-full bg-[#e8ede9] text-[#1c382b] border border-[#cbd8cf] flex items-center justify-center shrink-0 tracking-wide select-none ${sizeClasses} ${className}`}
    >
      {initials}
    </div>
  );
}

