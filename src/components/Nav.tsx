"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/lib/store";

export function BottomNav() {
  const pathname = usePathname();
  const { userRole, currentUser, invitations } = useApp();

  const pendingInvitesCount = (invitations || []).filter(
    (i) => (i.toUserId === currentUser?.id || i.invitedUserId === currentUser?.id) && i.status === "pending"
  ).length;

  const items =
    userRole === "guide"
      ? [
          { href: "/app/guide-dashboard", label: "Dashboard", icon: HomeIcon },
          { href: "/app/messages", label: "Messages", icon: ChatIcon },
          { href: "/app/profile", label: "Profile", icon: UserIcon },
        ]
      : [
          { href: "/app", label: "Home", icon: HomeIcon },
          { href: "/app/explore", label: "Explore", icon: CompassIcon },
          { href: "/app/people", label: "People", icon: PeopleIcon },
          { href: "/app/planner", label: "Planner", icon: CalendarIcon },
          { href: "/app/invites", label: `Invites${pendingInvitesCount > 0 ? ` (${pendingInvitesCount})` : ""}`, icon: EnvelopeIcon },
          { href: "/app/trips", label: "Trips", icon: BagIcon },
          { href: "/app/messages", label: "Messages", icon: ChatIcon },
          { href: "/app/profile", label: "Profile", icon: UserIcon },
        ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-card/95 backdrop-blur md:hidden">
      <ul
        className={`mx-auto grid px-1 py-2 ${
          items.length === 8 ? "grid-cols-8" : items.length === 7 ? "grid-cols-7" : "grid-cols-3 max-w-sm"
        }`}
      >
        {items.map((item) => {
          const active =
            item.href === "/app"
              ? pathname === "/app"
              : item.href === "/app/guide-dashboard"
              ? pathname === "/app/guide-dashboard"
              : pathname.startsWith(item.href);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 rounded-lg px-0.5 py-1 text-[8.5px] transition-colors ${
                  active
                    ? "bg-[#e2ede5] text-[#153a25] font-semibold border border-[#b5d2be]"
                    : "text-muted hover:text-ink"
                }`}
              >
                <item.icon active={active} />
                <span className="truncate max-w-[45px]">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function SideNav() {
  const pathname = usePathname();
  const { userRole, currentUser, invitations } = useApp();

  const pendingInvitesCount = (invitations || []).filter(
    (i) => (i.toUserId === currentUser?.id || i.invitedUserId === currentUser?.id) && i.status === "pending"
  ).length;

  const items =
    userRole === "guide"
      ? [
          { href: "/app/guide-dashboard", label: "Dashboard", icon: HomeIcon },
          { href: "/app/messages", label: "Messages", icon: ChatIcon },
          { href: "/app/profile", label: "Profile", icon: UserIcon },
        ]
      : [
          { href: "/app", label: "Home", icon: HomeIcon },
          { href: "/app/explore", label: "Explore", icon: CompassIcon },
          { href: "/app/people", label: "Find People", icon: PeopleIcon },
          { href: "/app/planner", label: "Trip Planner", icon: CalendarIcon },
          { href: "/app/trips", label: "My Trips", icon: BagIcon },
          { href: "/app/invites", label: `Invitations ${pendingInvitesCount > 0 ? `(${pendingInvitesCount})` : ""}`, icon: EnvelopeIcon },
          { href: "/app/messages", label: "Messages", icon: ChatIcon },
          { href: "/app/profile", label: "Profile", icon: UserIcon },
        ];

  return (
    <aside className="hidden w-56 shrink-0 border-r border-line bg-card p-4 md:flex md:flex-col justify-between">
      <div>
        <Link href={userRole === "guide" ? "/app/guide-dashboard" : "/app"} className="px-2 pb-6 block font-serif text-2xl font-bold text-ink">
          Zovira
        </Link>
        <ul className="space-y-1">
          {items.map((item) => {
            const active =
              item.href === "/app"
                ? pathname === "/app"
                : item.href === "/app/guide-dashboard"
                ? pathname === "/app/guide-dashboard"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs transition-colors ${
                    active
                      ? "bg-[#e2ede5] text-[#153a25] font-semibold border border-[#b5d2be]"
                      : "text-ink hover:bg-sand/60 font-medium"
                  }`}
                >
                  <item.icon active={active} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pt-4 border-t border-line text-[11px] text-muted px-2">
        {userRole === "guide" ? (
          <span>Guide Portal Active</span>
        ) : (
          <span>Traveler Portal</span>
        )}
      </div>
    </aside>
  );
}

function HomeIcon({ active }: { active?: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
      <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.2 6.2L8 16l2.2-6.2z" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8h12l1 12H5L6 8z" />
      <path d="M9 8V7a3 3 0 0 1 6 0v1" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 18.5 4 21l3.2-1.2A9 9 0 1 0 5 18.5z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 19.2a7 7 0 0 1 14 0" />
    </svg>
  );
}
