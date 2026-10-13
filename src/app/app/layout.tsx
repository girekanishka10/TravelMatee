"use client";

import { AuthGate } from "@/components/AuthGate";
import { BottomNav, SideNav } from "@/components/Nav";
import { useApp } from "@/lib/store";
import { Avatar } from "@/components/Ui";
import Link from "next/link";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, currentGuide, userRole, users, guides, switchAccount } = useApp();
  const activeUser = currentUser || currentGuide;

  return (
    <AuthGate needQuiz={userRole !== "guide"}>
      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex min-h-screen flex-1 flex-col">
          <header className="hidden items-center justify-between border-b border-line px-8 py-3.5 md:flex bg-card">
            <p className="text-xs text-muted">
              {userRole === "guide"
                ? "Guide Portal • Direct traveler inquiries and group connections"
                : "Don't just choose a destination. Choose the right companions."}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted text-[11px]">Viewing as:</span>
                <select
                  value={currentUser?.id || currentGuide?.id || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    const isGuide = guides.some((g) => g.id === val);
                    switchAccount(val, isGuide ? "guide" : "traveler");
                  }}
                  className="rounded border border-line bg-paper px-2 py-1 text-xs text-ink font-medium outline-none"
                >
                  <optgroup label="Travelers">
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.city})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Certified Guides">
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name} ({g.location})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {activeUser && (
                <Link href="/app/profile" className="flex items-center gap-2 text-xs font-medium text-ink hover:text-forest">
                  <Avatar
                    name={activeUser.name}
                    photo={(activeUser as { profilePhoto?: string; photo?: string }).profilePhoto || (activeUser as { photo?: string }).photo}
                    size="xs"
                  />
                  <span>{activeUser.name}</span>
                  {userRole === "guide" && (
                    <span className="rounded bg-forest/10 px-1.5 py-0.5 text-[10px] text-forest font-semibold">
                      Guide
                    </span>
                  )}
                </Link>
              )}
            </div>
          </header>
          <div className="flex-1 pb-24 md:pb-8">{children}</div>
        </div>
        <BottomNav />
      </div>
    </AuthGate>
  );
}
