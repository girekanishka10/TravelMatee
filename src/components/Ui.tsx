"use client";

import { useState } from "react";
import { ACTIVITY_OPTIONS } from "@/lib/quiz";
import { getInitials } from "@/lib/format";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sand px-2.5 py-1 text-xs text-ink">
      {children}
    </span>
  );
}

export function FemaleTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200/90 shadow-2xs ${className}`}
      title="Female Traveler"
    >
      <span className="text-[12px] leading-none">♀</span> Female
    </span>
  );
}

export function VerificationBadge({
  status,
  className = "",
}: {
  status?: string;
  className?: string;
}) {
  if (status === "verified") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-[11px] font-medium text-forest border border-forest/20 ${className}`}
      >
        ✓ Verified
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200 ${className}`}
      >
        ⏳ Verification Pending
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-700 border border-red-200 ${className}`}
      >
        ✕ Rejected
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[11px] font-medium text-muted border border-line ${className}`}
    >
      Not verified
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
  const [hasError, setHasError] = useState(false);
  const initials = getInitials(name);
  const sizeClasses = {
    xs: "h-7 w-7 text-[10px]",
    sm: "h-8 w-8 text-xs font-medium",
    md: "h-11 w-11 text-xs font-semibold",
    lg: "h-14 w-14 text-sm font-bold",
    xl: "h-16 w-16 text-base font-bold",
  }[size];

  if (photo && photo.trim().length > 0 && !hasError) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setHasError(true)}
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

