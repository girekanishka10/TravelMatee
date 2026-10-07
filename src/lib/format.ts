export function ageFromDob(dob: string) {
  const d = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  const year = e.getFullYear();
  return `${s.toLocaleDateString("en-IN", opts)}–${e.toLocaleDateString("en-IN", opts)} ${year}`;
}

export function formatINR(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function firstName(name: string) {
  return name.split(" ")[0];
}

export function getInitials(name: string): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  // Handle honorifics/titles like Dr, Mr, Ms
  if (parts.length > 2 && /^(dr|mr|ms|mrs|prof)\.?$/i.test(parts[0])) {
    return (parts[1][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

