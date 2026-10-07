"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/lib/store";

export function AuthGate({
  children,
  needQuiz = false,
}: {
  children: React.ReactNode;
  needQuiz?: boolean;
}) {
  const { currentUser, currentGuide, hydrated, userRole } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!hydrated) return;

    // Neither traveler nor guide is logged in
    if (!currentUser && !currentGuide) {
      router.replace("/login");
      return;
    }

    // Guide is logged in -> no traveler verification or quiz needed
    if (userRole === "guide" || currentGuide) {
      return;
    }

    // Traveler verification flow
    if (currentUser && currentUser.verificationStatus !== "verified") {
      router.replace("/verify");
      return;
    }

    // Traveler quiz flow
    if (currentUser && needQuiz && !currentUser.compatibilityAnswers) {
      router.replace("/quiz");
    }
  }, [hydrated, currentUser, currentGuide, userRole, needQuiz, router]);

  if (!hydrated || (!currentUser && !currentGuide)) {
    return <div className="p-8 text-center text-xs text-muted">Loading TravelMate...</div>;
  }

  if (currentUser && needQuiz && !currentUser.compatibilityAnswers && userRole !== "guide") {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Please complete your 15-question compatibility test to continue.
      </div>
    );
  }

  return <>{children}</>;
}
